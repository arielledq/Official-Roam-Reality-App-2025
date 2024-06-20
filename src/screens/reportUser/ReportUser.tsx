import React from "react"
import { View, Modal, Text, TouchableOpacity } from "react-native"
import { SvgXml } from "react-native-svg"
import { Icons } from "../../assets/Icons"
import ReactNativeModal from "react-native-modal"
import theme from "../../assets/theme"

interface ReportUserModalProps {
  isVisible: boolean;
  onClose: () => void;
  onReportUser: () => void;
}

const ReportUserModal: React.FC<ReportUserModalProps> = ({
  isVisible,
  onClose,
  onReportUser
}) => {
  return (
    <ReactNativeModal isVisible={isVisible} onDismiss={onClose}>
      <View style={styles.container}>
        <View style={styles.modal}>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <Text style={styles.title}>Report/Flag (Content or User)</Text>
            <SvgXml xml={Icons.closeModal} />
          </View>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.reportButton}
              onPress={onReportUser}
            >
              <Text style={styles.buttonText}>Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ReactNativeModal>
  )
}

const styles = {
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  modal: {
    backgroundColor: theme.lightColors?.inputBlue,
    borderRadius: 8,
    padding: 16,
    width: "80%"
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8
  },
  description: {
    fontSize: 16,
    marginBottom: 16
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end"
  },
  cancelButton: {
    marginRight: 8
  },
  reportButton: {
    backgroundColor: "red",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4
  },
  buttonText: {
    color: "white",
    fontWeight: "bold"
  }
}

export default ReportUserModal
