import * as Yup from 'yup';
import { emailRegex, passRegex } from './regex';
import Strings from '../constants/Strings';

export const SigninSchema = Yup.object().shape({
    email: Yup.string().matches(emailRegex, Strings.EmailError).required('Required'),
    password: Yup.string().matches(passRegex, Strings.PasswordError).required('Required'),
  });
export const SignUpSchema = Yup.object().shape({
    email: Yup.string().matches(emailRegex, Strings.EmailError).required('Required'),
    password: Yup.string().matches(passRegex, Strings.PasswordError).required('Required'),
    confirmPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match').required('Required'),
  });
export const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string().matches(emailRegex, Strings.EmailError).required('Required'),
  });
  