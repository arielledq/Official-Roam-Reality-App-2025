import {makeStyles} from "@rneui/themed";

const useStyles = makeStyles(theme => ({
  imageBg: {
    width: "100%",
    height: "100%",
    alignItems: "center",
  },
  image: {
    width: "70%",
    height: "55%",
  },
  headerText: {
    fontSize: 40,
    fontWeight: "400",
    lineHeight: 54,
    color: "#fff",
    marginTop: "20%",
    marginBottom: 30,
  },
  boldText: {
    fontWeight: "700",
  },
  footerText1: {
    fontSize: 16,
    fontWeight: "300",
    lineHeight: 21,
    color: "#fff",
    marginTop: 25,
    marginBottom: 10,
  },
  footerText2: {
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 27,
    color: "#fff",
    marginBottom: 25,
  },
  btnContainer: {
    width: "90%",
    paddingHorizontal: 10,
    position: "absolute",
    bottom: 20,
  },
}));

export default useStyles;
