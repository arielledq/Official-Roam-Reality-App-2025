import { makeStyles } from '@rneui/themed';

const AVATAR_SIZE = 105;

const useStyles = makeStyles((theme) => ({
  parent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    marginBottom: 10
  },
  avatarContainer: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    // marginTop: 4,
  },
  avatarViewStyles: {
    borderWidth: 1,
    borderColor: theme.colors.purple,
    borderStyle: 'dashed',
    borderRadius: 8,
  },
  avatarStyles: {
    width : 105, 
    height: 105,
    borderRadius: 8
  },
  
  avatarContainer_2: { justifyContent: 'center', alignItems: 'center' },
  imageBG: {
    padding: '3%',
  },
  addImage: { width: 100, height: 100, alignSelf: 'center' },
  imageBackground: {
    height: 140,
    width: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  imagePresentBackground:{
    height: 140,
    width: 160,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    marginBottom: 7
  },
  plusIcon: {
    marginTop: '-9%'
  },
  plusIconWithImage: {
    marginTop: '-7%',
    alignSelf: 'center'
  }
}));

export { useStyles, AVATAR_SIZE };
