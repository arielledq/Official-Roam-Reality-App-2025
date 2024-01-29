import { makeStyles } from '@rneui/themed';

const useStyles = makeStyles((theme) => ({
  contentContainer: {
    flex: 1,
  },
  bottomSheetStyle: { backgroundColor: theme.colors.inputBG },
  dragIndicatorStyle: {
    backgroundColor: '#FFF', 
  },
  backdrop: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Adjust the alpha value for the desired blur effect
  },
}));

export default useStyles;
