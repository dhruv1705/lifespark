import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme';

export const ProfileScreen: React.FC = () => {
  const { user, signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  const ProfileRow = ({ icon, title, subtitle, onPress }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
  }) => (
    <TouchableOpacity style={styles.profileRow} onPress={onPress} disabled={!onPress}>
      <View style={styles.profileRowIcon}>
        <Text style={styles.iconText}>{icon}</Text>
      </View>
      <View style={styles.profileRowContent}>
        <Text style={styles.profileRowTitle}>{title}</Text>
        {subtitle && <Text style={styles.profileRowSubtitle}>{subtitle}</Text>}
      </View>
      {onPress && <Text style={styles.chevron}>›</Text>}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.name}>{user?.email || 'User'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.sectionContent}>
            <ProfileRow
              icon="👤"
              title="Personal Information"
              subtitle="Update your profile details"
              onPress={() => Alert.alert('Coming Soon', 'Profile editing will be available soon!')}
            />
            <ProfileRow
              icon="🔔"
              title="Notifications"
              subtitle="Manage your notification preferences"
              onPress={() => Alert.alert('Coming Soon', 'Notification settings will be available soon!')}
            />
            <ProfileRow
              icon="🔒"
              title="Privacy & Security"
              subtitle="Control your privacy settings"
              onPress={() => Alert.alert('Coming Soon', 'Privacy settings will be available soon!')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Preferences</Text>
          <View style={styles.sectionContent}>
            <ProfileRow
              icon="🎨"
              title="Theme"
              subtitle="Light mode"
              onPress={() => Alert.alert('Coming Soon', 'Theme selection will be available soon!')}
            />
            <ProfileRow
              icon="📊"
              title="Data & Analytics"
              subtitle="Manage your data preferences"
              onPress={() => Alert.alert('Coming Soon', 'Data settings will be available soon!')}
            />
            <ProfileRow
              icon="💾"
              title="Data Export"
              subtitle="Download your habit data"
              onPress={() => Alert.alert('Coming Soon', 'Data export will be available soon!')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.sectionContent}>
            <ProfileRow
              icon="❓"
              title="Help & Support"
              subtitle="Get help and contact support"
              onPress={() => Alert.alert('Help', 'For support, please contact us at support@lifespark.app')}
            />
            <ProfileRow
              icon="⭐"
              title="Rate the App"
              subtitle="Share your feedback"
              onPress={() => Alert.alert('Coming Soon', 'App rating will be available soon!')}
            />
            <ProfileRow
              icon="📄"
              title="Terms & Privacy"
              subtitle="Read our terms and privacy policy"
              onPress={() => Alert.alert('Coming Soon', 'Terms and privacy will be available soon!')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionContent}>
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Lifespark v1.0.0</Text>
          <Text style={styles.footerSubtext}>Build better habits, spark your life</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: theme.spacing.xxl - theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    marginBottom: theme.spacing.lg,
  },
  avatarContainer: {
    width: theme.spacing.xxl + theme.spacing.xxl + theme.spacing.md,
    height: theme.spacing.xxl + theme.spacing.xxl + theme.spacing.md,
    borderRadius: theme.borderRadius.xl + theme.spacing.lg,
    backgroundColor: theme.colors.secondary.orange,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  avatarText: {
    fontSize: theme.typography.sizes.heading,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.inverse,
  },
  name: {
    fontSize: theme.typography.sizes.xxl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  email: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md - theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionContent: {
    backgroundColor: theme.colors.surface,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.neutral.lightGray,
  },
  profileRowIcon: {
    width: theme.spacing.xxl + theme.spacing.sm,
    height: theme.spacing.xxl + theme.spacing.sm,
    borderRadius: theme.borderRadius.xl,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  iconText: {
    fontSize: theme.spacing.lg,
  },
  profileRowContent: {
    flex: 1,
  },
  profileRowTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.medium,
    color: theme.colors.text.primary,
  },
  profileRowSubtitle: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs / 2,
  },
  chevron: {
    fontSize: theme.spacing.lg,
    color: theme.colors.neutral.mediumGray,
    fontWeight: theme.typography.weights.normal,
  },
  signOutButton: {
    margin: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.secondary.orange,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  signOutText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.inverse,
  },
  footer: {
    alignItems: 'center',
    padding: theme.spacing.xxl - theme.spacing.sm,
  },
  footerText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.xs,
  },
  footerSubtext: {
    fontSize: theme.typography.sizes.xs,
    color: theme.colors.neutral.mediumGray,
  },
});