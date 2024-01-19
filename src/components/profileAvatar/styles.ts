import { makeStyles } from '@rneui/themed';

const AVATAR_SIZE = 166;

const useStyles = makeStyles((theme) => ({
  parent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10
  },
  avatarContainer: {
    backgroundColor: theme.colors.inputBG,
    borderRadius: AVATAR_SIZE / 2,
  },
  avatarContainer_2: { justifyContent: 'center', alignItems: 'center' },
  avatarStyles: { borderRadius: AVATAR_SIZE / 2 },
  imageBG: {
    padding: '3%',
  },
  addImage: { width: 100, height: 100, alignSelf: 'center' },
  imageBackground: {
    height: 140,
    width: 160,
    alignItems: 'center',
    justifyContent: 'center'
  },
  plusIcon: {
    marginTop: '-9%'
  }
}));

export { useStyles, AVATAR_SIZE };
