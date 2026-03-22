import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import 'react-native-reanimated';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider';
import '@/global.css';
import { db } from '@/src/infrastructure/persistence/sqlite/database';
import migrations from '../drizzle/migrations';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>DBの初期化に失敗しました: {error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return null;
  }

  return (
    <GluestackUIProvider mode={colorScheme ?? 'system'}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="expense/create"
            options={{ presentation: 'modal', title: '支出を登録' }}
          />
          <Stack.Screen
            name="expense/[id]"
            options={{ presentation: 'modal', title: '支出を編集' }}
          />
          <Stack.Screen
            name="template/create"
            options={{ presentation: 'modal', title: 'テンプレートを登録' }}
          />
          <Stack.Screen
            name="template/[id]"
            options={{ presentation: 'modal', title: 'テンプレートを編集' }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GluestackUIProvider>
  );
}
