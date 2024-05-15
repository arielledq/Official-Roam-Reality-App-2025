import * as Yup from "yup"
import { emailRegex, passRegex } from "./regex"
import Strings from "../constants/Strings"

export const SigninSchema = Yup.object().shape({
  email: Yup.string()
    .matches(emailRegex, Strings.EmailError)
    .required("Please enter your email address"),
  password: Yup.string().required("Please enter your password")
})
export const SignUpSchema = Yup.object().shape({
  email: Yup.string()
    .matches(emailRegex, Strings.EmailError)
    .required("Please enter your email address"),
  password: Yup.string()
    .matches(passRegex, Strings.PasswordError)
    .required("Please enter your password"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Please confirm your password")
})
export const ForgotPasswordSchema = Yup.object().shape({
  input: Yup.string()
    .matches(emailRegex, Strings.EmailError)
    .required("Please enter your email address")
})

export const ChangePasswordSchema = Yup.object().shape({
  oldPassword: Yup.string().required("Please enter your existing password"),
  newPassword: Yup.string()
    .matches(passRegex, Strings.PasswordError)
    .required("Please enter a new password"),
  confirmnewPassword: Yup.string()
    .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
    .required("Please confirm your new password")
})
export const OTPSchema = Yup.object().shape({
  input: Yup.string().required("Please enter the code")
})
export const FPChangePasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .matches(passRegex, Strings.PasswordError)
    .required("Please enter a new password"),
  confirmnewPassword: Yup.string()
    .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
    .required("Please confirm your new password")
})

export const EditProfileSchema = Yup.object().shape({
  name: Yup.string().required("Full name is required"),
  phoneNumber: Yup.string()
    .length(14, "Invalid phone number")
    .required("Phone number is required")
  // .required('Phone number is required'),
  // address: Yup.string().required('Home address is required'),
  // gender: Yup.string().required('Gender is required'),
  // country: Yup.string().required('Home country is required'),
  // dob: Yup.date().required('Date of birth is required'),
})

export const ContactUsSchema = Yup.object().shape({
  name: Yup.string().required("Full name is required"),
  email: Yup.string()
    .matches(emailRegex, Strings.EmailError)
    .required("Please enter your email address"),
  message: Yup.string().required("Please write your message")
})

export const feedbackSchema = Yup.object().shape({
  title: Yup.string().required("Title is required"),
  description: Yup.string().required("Description is required")
})

export const inviteFriendSchema = Yup.object().shape({
  email: Yup.string()
    .matches(emailRegex, Strings.EmailError)
    .required("Email is required")
})
