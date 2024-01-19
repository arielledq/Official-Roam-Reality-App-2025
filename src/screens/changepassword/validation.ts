import * as Yup from 'yup';

export const validationSchema = Yup.object().shape({
  oldPassword: Yup.string()
    .required('Please enter your existing password'),
  newPassword: Yup.string()
    .oneOf([Yup.ref('confirmnewPassword'), ''], 'Passwords must match')
    .required('Please add new password'),
  confirmnewPassword: Yup.string()
    .oneOf([Yup.ref('newPassword'), ''], 'Passwords must match')
    .required('Please confirm your password'),
});
