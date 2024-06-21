import React, { useState } from "react"
import {
  View,
  Modal,
  Text,
  TouchableOpacity,
  Keyboard,
  Pressable,
  Image
} from "react-native"
import { SvgXml } from "react-native-svg"
import { Icons } from "../../assets/Icons"
import ReactNativeModal from "react-native-modal"
import theme from "../../assets/theme"
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view"
import { AppInput } from "../../components"
import useStyles from "./styles"
import { color } from "react-native-reanimated"
import { FontFamily } from "../../util/FontUtils"
import Images from "../../assets/images"

interface ReportUserModalProps {
  isVisible: boolean;
  onClose: () => void;
  onReportUser: (reportReason: "", issueDescripton?: "") => void;
}

const REPORT_OPTIONS = [
  { key: 1, value: "Spam" },
  { key: 2, value: "Pornography" },
  { key: 3, value: "Hate" },
  { key: 4, value: "Bullying" },
  { key: 5, value: "Self-Harm" },
  { key: 6, value: "Violent" },
  { key: 7, value: "Gory" },
  { key: 8, value: "Harmful Content" },
  { key: 9, value: "Child Porn" },
  { key: 10, value: "Illegal Activities" },
  { key: 11, value: "Deceptive" },
  { key: 12, value: "Copyright & Trademark Infringement" },
  { key: 13, value: "Other" }
]

const ReportUserModal: React.FC<ReportUserModalProps> = ({
  isVisible,
  onClose,
  onReportUser
}) => {
  const [selectedProblem, setSelectedProblem] = useState()
  const [description, setDescription] = useState("")
  const _styles = useStyles()
  return (
    <ReactNativeModal isVisible={isVisible} onDismiss={onClose}>
      <KeyboardAwareScrollView contentContainerStyle={styles.container}>
        <View style={styles.modal}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <View style={{ flex: 0.9 }}>
              <Text style={styles.title}>Report/Flag (Content or User)</Text>
              <Text style={styles.subTitle}>
                Pleas provide us a reason for the reporting.
              </Text>
            </View>
            <Pressable style={{ flex: 0.1 }} onPress={onClose}>
              <Image source={Images.CloseModal} />
            </Pressable>
          </View>
          {REPORT_OPTIONS.map((option, index) => (
            <TouchableOpacity
              style={styles.optionsContainer}
              onPress={() => setSelectedProblem(option)}
            >
              <View style={styles.radioButton}>
                {selectedProblem?.key === option?.key && (
                  <View style={styles.radioSelected} />
                )}
              </View>
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
          <AppInput
            style={[
              _styles.input,
              _styles.textbox,
              { backgroundColor: "white", marginTop: 10, color: "black" }
            ]}
            selectionColor={"white"}
            placeholder="Please specify"
            onSubmitEditing={Keyboard.dismiss}
            placeholderTextColor={theme.darkColors?.grey}
            value={description}
            onChangeText={setDescription}
            autoCapitalize="none"
            textAlignVertical="top"
            multiline={true}
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.reportButton}
              onPress={() => onReportUser(selectedProblem?.key, description)}
            >
              <Text style={styles.buttonText}>Report</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </ReactNativeModal>
  )
}

const styles = {
  container: {},
  modal: {
    backgroundColor: theme.lightColors?.boxStatBG,
    borderRadius: 8,
    padding: 16,
    width: "90%"
  },
  title: {
    fontSize: 16,
    color: theme.lightColors?.white,
    FontFamily: FontFamily.PoppinsBold,
    fontWeight: 600,
    marginBottom: 8
  },
  subTitle: {
    fontSize: 10,
    color: theme.lightColors?.white,
    FontFamily: FontFamily.NunitoSansRegular,
    fontWeight: 400,
    marginBottom: 15
  },
  description: {
    fontSize: 16,
    marginBottom: 16
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 40
  },
  cancelButton: {
    marginRight: 8
  },
  reportButton: {
    backgroundColor: "#D75D50",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4
  },
  cancelBtn: {
    borderColor: "white",
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4
  },
  buttonText: {
    color: "white",
    fontWeight: "bold"
  },
  optionsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: theme.lightColors?.white,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center"
  },
  radioSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.lightColors?.white
  },
  optionText: {
    fontSize: 14,
    fontWeight: 600,
    color: theme.lightColors?.white,
    FontFamily: FontFamily.PoppinsBold
  }
}

export default ReportUserModal
