import { ReactNode } from 'react';
import { View } from 'react-native';

interface Props {
  children: ReactNode;
}

export function AppBackground({ children }: Props) {
  return (
    <View style={{ flex: 1, backgroundColor: '#0D0B2E' }}>
      {children}
    </View>
  );
}
