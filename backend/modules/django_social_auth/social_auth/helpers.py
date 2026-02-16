import requests
import jwt
from jwt import PyJWKClient

def get_standard_facebook_user(token: str, app_id: str = None):
    """
    Try to fetch Facebook user info using the Graph API.
    """
    url = "https://graph.facebook.com/me"
    params = {"fields": "id,name,first_name,last_name,email", "access_token": token}
    response = requests.get(url, params=params)

    if response.status_code != 200:
        error_data = {}
        try:
            error_data = response.json()
        except:
            pass
        
        # Check for specific Facebook error messages
        if error_data.get('error'):
            error_info = error_data['error']
            error_message = error_info.get('message', 'Unknown error')
            error_type = error_info.get('type', '')
            error_code = error_info.get('code', '')
            error_subcode = error_info.get('error_subcode', '')
            
            error_lower = error_message.lower()
            
            # Handle "Bad signature" error (token is invalid/corrupted) - check this first
            if 'bad signature' in error_lower:
                raise ValueError(
                    f"Invalid Facebook access token: Bad signature. The token may be corrupted, expired, or invalid. "
                    f"Please request a new token from Facebook. Error details: {error_message}"
                )
            
            # Handle expired token
            if 'expired' in error_lower:
                raise ValueError(
                    f"Facebook access token has expired. Please request a new token. "
                    f"Error details: {error_message}"
                )
            
            # Handle "Invalid OAuth access token" errors (code 190)
            if error_code == 190 or 'invalid oauth access token' in error_lower:
                # Check if it's specifically an audience mismatch (subcode 467)
                if 'audience' in error_lower or error_subcode == 467:
                    if app_id:
                        raise ValueError(
                            f"Token audience doesn't match. The access token was issued for a different Facebook App. "
                            f"Expected App ID: {app_id}. Please ensure the token is from the correct Facebook app. "
                            f"Error details: {error_message}"
                        )
                    else:
                        raise ValueError(
                            f"Token audience doesn't match. The access token was issued for a different Facebook App. "
                            f"Error details: {error_message}. Please configure FACEBOOK_APP_ID in settings."
                        )
                # Check for bad signature subcode (463)
                elif error_subcode == 463:
                    raise ValueError(
                        f"Invalid Facebook access token: Bad signature. The token may be corrupted or invalid. "
                        f"Please request a new token from Facebook. Error details: {error_message}"
                    )
                else:
                    # Generic OAuth error (code 190)
                    raise ValueError(
                        f"Invalid Facebook OAuth access token. Error code: {error_code}, Subcode: {error_subcode}, "
                        f"Error details: {error_message}. Please ensure the token is valid and not expired."
                    )
        
        response.raise_for_status()

    data = response.json()
    if "id" not in data:
        raise ValueError("Invalid token (missing id)")

    return {
        "facebookUserId": data["id"],
        "facebookUserName": data.get("name", ""),
        "facebookFirstName": data.get("first_name", ""),
        "facebookLastName": data.get("last_name", ""),
        "facebookUserEmail": data.get("email", "")
    }


def get_limited_facebook_user(token: str, app_id: str):
    """
    Validate token using JWKS (Facebook's public keys).
    Only works for ID tokens (JWTs), not user access tokens.
    """
    # Check if token is a JWT (has 3 parts separated by dots)
    if not token or len(token.split('.')) != 3:
        raise ValueError("Token is not a JWT. User access tokens cannot be validated with JWKS.")
    
    try:
        jwks_url = "https://www.facebook.com/.well-known/oauth/openid/jwks"
        # PyJWT provides a JWK client similar to jwks-rsa
        jwks_client = PyJWKClient(jwks_url)
        # This retrieves the signing key for the token automatically
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        # Try to decode with audience validation
        # If app_id is not provided or empty, skip audience validation
        decode_options = {
            "verify_signature": True,
            "verify_exp": True,
            "verify_iss": True,
        }
        
        if app_id:
            decoded = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                audience=app_id,
                issuer="https://www.facebook.com",
                options=decode_options,
            )
        else:
            # Decode without audience validation if app_id is not provided
            decoded = jwt.decode(
                token,
                signing_key.key,
                algorithms=["RS256"],
                issuer="https://www.facebook.com",
                options=decode_options,
            )

        if "sub" not in decoded:
            raise ValueError("Invalid token (missing sub)")

        return {
            "facebookUserId": decoded["sub"],
            "facebookUserName": decoded.get("name", ""),
            "facebookFirstName": decoded.get("given_name", ""),
            "facebookLastName": decoded.get("family_name", ""),
            "facebookUserEmail": decoded.get("email", ""),
        }
    except jwt.InvalidAudienceError:
        # Audience mismatch - token might be for a different app
        raise ValueError(f"Token audience doesn't match App ID. Expected: {app_id}")
    except jwt.DecodeError as e:
        raise ValueError(f"Failed to decode JWT token: {str(e)}")
    except Exception as e:
        raise ValueError(f"Token validation failed: {str(e)}")


def get_facebook_user(token: str, app_id: str, prefer_limited: bool = False):
    """
    Try Graph API first, fall back to JWKS verification.
    Graph API works with user access tokens (most common from mobile apps).
    JWKS verification only works with ID tokens (JWTs).
    """
    if prefer_limited:
        return get_limited_facebook_user(token, app_id)

    try:
        return get_standard_facebook_user(token, app_id)
    except ValueError as value_error:
        # Standard Graph call returned a Facebook error (not a network issue).
        # Limited Login tokens typically fail here with "Bad signature".
        if token and len(token.split('.')) == 3:
            try:
                return get_limited_facebook_user(token, app_id)
            except Exception:
                # If JWKS flow also fails, bubble up original error for context.
                raise value_error
        raise
    except requests.RequestException as e:
        # Graph API failed - might be invalid token or network issue
        # Try JWKS verification only if token looks like a JWT
        error_msg = str(e)
        if hasattr(e, 'response') and e.response is not None:
            try:
                error_data = e.response.json()
                error_msg = error_data.get('error', {}).get('message', error_msg)
            except:
                pass
        
        # Check if token is a JWT before trying JWKS
        if token and len(token.split('.')) == 3:
            print(f"Graph API failed ({error_msg}), trying JWKS verification for JWT token")
            try:
                return get_limited_facebook_user(token, app_id)
            except Exception as jwks_error:
                raise ValueError(f"Both Graph API and JWKS verification failed. Graph API error: {error_msg}. JWKS error: {str(jwks_error)}")
        else:
            # Token is not a JWT, so JWKS won't work
            raise ValueError(f"Graph API failed and token is not a JWT. Error: {error_msg}. Please ensure you're using a valid Facebook user access token.")