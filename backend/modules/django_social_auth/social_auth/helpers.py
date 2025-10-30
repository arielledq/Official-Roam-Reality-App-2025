import requests
import jwt
from jwt import PyJWKClient

def get_standard_facebook_user(token: str):
    """
    Try to fetch Facebook user info using the Graph API.
    """
    url = "https://graph.facebook.com/me"
    params = {"fields": "id,name,first_name,last_name,email", "access_token": token}
    response = requests.get(url, params=params)

    if response.status_code != 200:
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
    """
    jwks_url = "https://www.facebook.com/.well-known/oauth/openid/jwks"
    # PyJWT provides a JWK client similar to jwks-rsa
    jwks_client = PyJWKClient(jwks_url)
    # This retrieves the signing key for the token automatically
    signing_key = jwks_client.get_signing_key_from_jwt(token)

    decoded = jwt.decode(
        token,
        signing_key.key,
        algorithms=["RS256"],
        audience=app_id,
        issuer="https://www.facebook.com",
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


def get_facebook_user(token: str, app_id: str):
    """
    Try Graph API first, fall back to JWKS verification.
    """
    try:
        return get_standard_facebook_user(token)
    except requests.RequestException:
        # Equivalent to isAxiosError in TS
        print("Failed to get standard Facebook user, trying limited user")
        return get_limited_facebook_user(token, app_id)