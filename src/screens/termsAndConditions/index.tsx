import BackgroundWithImage from '../../components/background';
import React from 'react'
import { Dimensions, StyleSheet, Text, View } from 'react-native'
import RenderHtml from 'react-native-render-html';

const { width } = Dimensions.get('window');

const source = {
  html: `
  <p><span style="color:#ffffff"><strong>Please read these terms and conditions carefully before using our application.</strong></span><br />
  <span style="color:#9ca3af">By accessing or using the application, you agree to be bound by these terms and conditions. If you do not agree with any part of these terms and conditions, please refrain from using the application. </span></p>
  <ol>
    <li><span style="color:#ffffff"><strong>Use of the Application</strong></span> <span style="color:#9ca3af">a. The application is intended for personal, non-commercial use only. b. You must be at least 18 years old or have parental consent to use the application. c. You are responsible for maintaining the confidentiality of your account and password and for restricting access to your device. d. You agree to provide accurate and up-to-date information during the registration process. </span></li>
    <li><span style="color:#ffffff"><strong>Intellectual Property</strong></span> <span style="color:#9ca3af">a. The application and its content are protected by intellectual property laws and are the property of the application owner. b. You may not modify, copy, distribute, transmit, display, perform, reproduce, publish, license, create derivative works from, transfer, or sell any information, software, products, or services obtained from the application.</span></li>
    <li><span style="color:#ffffff"><strong>Privacy Policy</strong></span> <span style="color:#9ca3af">a. Your privacy is important to us. Please refer to our Privacy Policy for details on how we collect, use, and disclose personal information.</span></li>
    <li><span style="color:#ffffff"><strong>Limitation of Liability</strong></span> <span style="color:#9ca3af">a. The application owner shall not be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in connection with the use of the application. b. We do not warrant that the application will be error-free, uninterrupted, or secure.</span></li>
    <li><span style="color:#ffffff"><strong>Termination</strong></span> <span style="color:#9ca3af">a. We reserve the right to terminate or suspend your access to the application at any time without prior notice or liability.</span></li>
    <li><span style="color:#ffffff"><strong>Governing Law</strong></span> <span style="color:#9ca3af">a. These terms and conditions shall be governed by and construed in accordance with the laws of [Jurisdiction].</span></li>
    <li><span style="color:#9ca3af">By using the application, you acknowledge that you have read, understood, and agreed to these terms and conditions. If you have any questions or concerns, please contact us at [Contact Information].</span></li>
  </ol>
  `
};

const TermsAndConditions = () => {
  return (
    <BackgroundWithImage>
      <View
  yle={{ marginHorizontal: 20}}
>
      <RenderHtml
        contentWidth={width}
        source={source}
      />
    </View>
    </BackgroundWithImage>        
  )           
}   
   
export default TermsAndConditions

const styles = StyleSheet.create({})