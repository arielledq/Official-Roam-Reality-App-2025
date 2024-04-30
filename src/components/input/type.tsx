import { InputProps } from '@rneui/themed';
import { Ref } from 'react';

export type TextInputProps = InputProps & {
  ref?: Ref<InputProps>;
};
