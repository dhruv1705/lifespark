import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Switch,
  Alert,
  ScrollView,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../theme';
import { notificationService, HabitReminder, ReminderType } from '../services/notificationService';
import { reminderStorage } from '../services/reminderStorage';
import { scheduleService } from '../services/scheduleService';
import { WeeklyDaySelector } from './WeeklyDaySelector';
import { MonthlyDaySelector } from './MonthlyDaySelector';

interface ReminderSetupModalProps {
  visible: boolean;
  onClose: () => void;
  habitId: string;
  habitName: string;
  onReminderSaved?: (reminder: HabitReminder) => void;
}

export const ReminderSetupModal: React.FC<ReminderSetupModalProps> = ({
  visible,
  onClose,
  habitId,
  habitName,
  onReminderSaved,
}) => {
  const [reminderTime, setReminderTime] = useState(new Date());
  const [reminderDate, setReminderDate] = useState(new Date());
  const [isEnabled, setIsEnabled] = useState(false);
  const [reminderType, setReminderType] = useState<ReminderType>('daily');
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState(1); // Monday
  const [selectedDayOfMonth, setSelectedDayOfMonth] = useState(1); // 1st
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load existing reminder when modal opens
  useEffect(() => {
    if (visible) {
      loadExistingReminder();
    }
  }, [visible, habitId]);

  const loadExistingReminder = async () => {
    try {
      const existingReminder = await reminderStorage.getReminder(habitId);
      if (existingReminder) {
        const [hours, minutes] = existingReminder.time.split(':').map(Number);
        const time = new Date();
        time.setHours(hours);
        time.setMinutes(minutes);
        
        setReminderTime(time);
        setIsEnabled(existingReminder.enabled);
        setReminderType(existingReminder.reminderType);
        
        if (existingReminder.dayOfWeek !== undefined) {
          setSelectedDayOfWeek(existingReminder.dayOfWeek);
        }
        
        if (existingReminder.dayOfMonth !== undefined) {
          setSelectedDayOfMonth(existingReminder.dayOfMonth);
        }
        
        if (existingReminder.specificDate) {
          const [year, month, day] = existingReminder.specificDate.split('-').map(Number);
          const date = new Date(year, month - 1, day);
          setReminderDate(date);
        }
      } else {
        // Default to current time + 1 hour
        const defaultTime = new Date();
        defaultTime.setHours(defaultTime.getHours() + 1);
        defaultTime.setMinutes(0);
        setReminderTime(defaultTime);
        setIsEnabled(false);
        setReminderType('daily');
      }
    } catch (error) {
      console.error('Error loading existing reminder:', error);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setReminderTime(selectedTime);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setReminderDate(selectedDate);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    
    try {
      const timeString = `${reminderTime.getHours().toString().padStart(2, '0')}:${reminderTime.getMinutes().toString().padStart(2, '0')}`;
      
      let specificDateString: string | undefined;
      if (reminderType === 'once') {
        specificDateString = `${reminderDate.getFullYear()}-${(reminderDate.getMonth() + 1).toString().padStart(2, '0')}-${reminderDate.getDate().toString().padStart(2, '0')}`;
      }
      
      const reminder: HabitReminder = {
        habitId,
        habitName,
        time: timeString,
        enabled: isEnabled,
        reminderType,
        dayOfWeek: reminderType === 'weekly' ? selectedDayOfWeek : undefined,
        dayOfMonth: reminderType === 'monthly' ? selectedDayOfMonth : undefined,
        specificDate: specificDateString,
      };

      // If enabling reminder, check permissions first
      if (isEnabled) {
        const hasPermissions = await notificationService.areNotificationsEnabled();
        if (!hasPermissions) {
          Alert.alert(
            'Notifications Disabled',
            'Please enable notifications in your device settings to receive habit reminders.',
            [{ text: 'OK' }]
          );
          setLoading(false);
          return;
        }

        // Schedule the notification
        const notificationId = await notificationService.scheduleHabitReminder(reminder);
        if (!notificationId) {
          Alert.alert('Error', 'Failed to schedule reminder. Please try again.');
          setLoading(false);
          return;
        }

        // Save to storage with notification ID
        await reminderStorage.saveReminder(reminder, notificationId);
      } else {
        // If disabling, cancel existing notification
        const existingReminder = await reminderStorage.getReminder(habitId);
        if (existingReminder?.notificationId) {
          await notificationService.cancelHabitReminder(existingReminder.notificationId);
        }
        
        // Save disabled reminder (or delete it)
        await reminderStorage.deleteReminder(habitId);
      }

      // Sync reminders to schedule after saving
      await scheduleService.syncRemindersToSchedule();

      onReminderSaved?.(reminder);
      onClose();
      
      const getSuccessMessage = (): string => {
        if (!isEnabled) return 'Reminder disabled';
        
        const formattedTime = reminderStorage.formatTimeForDisplay(timeString);
        const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        switch (reminderType) {
          case 'daily':
            return `Daily reminder set for ${formattedTime}`;
          case 'weekly':
            return `Weekly reminder set for ${dayNames[selectedDayOfWeek]} at ${formattedTime}`;
          case 'monthly':
            const suffix = selectedDayOfMonth === 1 ? 'st' : selectedDayOfMonth === 2 ? 'nd' : selectedDayOfMonth === 3 ? 'rd' : 'th';
            return `Monthly reminder set for the ${selectedDayOfMonth}${suffix} at ${formattedTime}`;
          case 'once':
            return `Reminder scheduled for ${new Date(reminderDate).toLocaleDateString()} at ${formattedTime}`;
          default:
            return `Reminder set for ${formattedTime}`;
        }
      };

      Alert.alert('Success', getSuccessMessage());
    } catch (error) {
      console.error('Error saving reminder:', error);
      Alert.alert('Error', 'Failed to save reminder. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDisplayTime = (time: Date): string => {
    const hours = time.getHours();
    const minutes = time.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Daily Reminder</Text>
          <TouchableOpacity 
            style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>
              {loading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.habitInfo}>
            <Text style={styles.habitIcon}>⏰</Text>
            <Text style={styles.habitName}>{habitName}</Text>
            <Text style={styles.habitSubtitle}>
              {isEnabled ? 'Get reminded daily' : 'No reminder set'}
            </Text>
          </View>

          {/* Enable/Disable Toggle */}
          <View style={styles.toggleRow}>
            <View>
              <Text style={styles.toggleLabel}>Enable Reminder</Text>
            </View>
            <Switch
              value={isEnabled}
              onValueChange={setIsEnabled}
              trackColor={{ 
                false: theme.colors.neutral.mediumGray, 
                true: theme.colors.primary.green + '40' 
              }}
              thumbColor={isEnabled ? theme.colors.primary.green : theme.colors.neutral.lightGray}
            />
          </View>

          {/* Reminder Type Selection */}
          {isEnabled && (
            <View style={styles.typeSection}>
              <Text style={styles.sectionTitle}>Reminder Type</Text>
              <View style={styles.typeButtonsGrid}>
                <TouchableOpacity 
                  style={[styles.typeButton, reminderType === 'daily' && styles.typeButtonActive]}
                  onPress={() => setReminderType('daily')}
                >
                  <Text style={[styles.typeButtonText, reminderType === 'daily' && styles.typeButtonTextActive]}>
                    🔄 Daily
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.typeButton, reminderType === 'weekly' && styles.typeButtonActive]}
                  onPress={() => setReminderType('weekly')}
                >
                  <Text style={[styles.typeButtonText, reminderType === 'weekly' && styles.typeButtonTextActive]}>
                    📅 Weekly
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.typeButton, reminderType === 'monthly' && styles.typeButtonActive]}
                  onPress={() => setReminderType('monthly')}
                >
                  <Text style={[styles.typeButtonText, reminderType === 'monthly' && styles.typeButtonTextActive]}>
                    🗓️ Monthly
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.typeButton, reminderType === 'once' && styles.typeButtonActive]}
                  onPress={() => setReminderType('once')}
                >
                  <Text style={[styles.typeButtonText, reminderType === 'once' && styles.typeButtonTextActive]}>
                    📌 Once
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Weekly Day Selection */}
          {isEnabled && reminderType === 'weekly' && (
            <WeeklyDaySelector 
              selectedDay={selectedDayOfWeek}
              onDaySelect={setSelectedDayOfWeek}
            />
          )}

          {/* Monthly Day Selection */}
          {isEnabled && reminderType === 'monthly' && (
            <MonthlyDaySelector 
              selectedDay={selectedDayOfMonth}
              onDaySelect={setSelectedDayOfMonth}
            />
          )}

          {/* Date Selection (for one-time reminders) */}
          {isEnabled && reminderType === 'once' && (
            <View style={styles.dateSection}>
              <Text style={styles.sectionTitle}>Reminder Date</Text>
              <TouchableOpacity 
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateIcon}>📅</Text>
                <Text style={styles.dateText}>
                  {reminderDate.toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
                <Text style={styles.dateArrow}>›</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Time Selection */}
          {isEnabled && (
            <View style={styles.timeSection}>
              <Text style={styles.sectionTitle}>Reminder Time</Text>
              <TouchableOpacity 
                style={styles.timeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Text style={styles.timeIcon}>🕐</Text>
                <Text style={styles.timeText}>{formatDisplayTime(reminderTime)}</Text>
                <Text style={styles.timeArrow}>›</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Info Section */}
          <View style={styles.infoSection}>
            <Text style={styles.infoText}>
              💡 Reminders work even when the app is closed. Make sure notifications are enabled in your device settings.
            </Text>
          </View>
        </ScrollView>

        {/* Time Picker */}
        {showTimePicker && (
          <DateTimePicker
            value={reminderTime}
            mode="time"
            is24Hour={false}
            display="default"
            onChange={handleTimeChange}
          />
        )}

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={reminderDate}
            mode="date"
            display="default"
            minimumDate={new Date()} // Can't select past dates
            onChange={handleDateChange}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  cancelButton: {
    paddingVertical: theme.spacing.xs,
  },
  cancelButtonText: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
  },
  headerTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  saveButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.primary.green,
    borderRadius: theme.borderRadius.md,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.inverse,
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  habitInfo: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  habitIcon: {
    fontSize: 48,
    marginBottom: theme.spacing.sm,
  },
  habitName: {
    fontSize: theme.typography.sizes.xl,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  habitSubtitle: {
    fontSize: theme.typography.sizes.md,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  toggleLabel: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  toggleSubtext: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  typeSection: {
    marginBottom: theme.spacing.lg,
  },
  typeButtonsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  typeButton: {
    width: '48%',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  typeButtonActive: {
    borderColor: theme.colors.primary.green,
    backgroundColor: theme.colors.primary.green + '10',
  },
  typeButtonText: {
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.secondary,
  },
  typeButtonTextActive: {
    color: theme.colors.primary.green,
  },
  dateSection: {
    marginBottom: theme.spacing.lg,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary.green,
  },
  dateIcon: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  dateText: {
    flex: 1,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  dateArrow: {
    fontSize: 20,
    color: theme.colors.text.secondary,
  },
  timeSection: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary.green,
  },
  timeIcon: {
    fontSize: 24,
    marginRight: theme.spacing.md,
  },
  timeText: {
    flex: 1,
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
  },
  timeArrow: {
    fontSize: 20,
    color: theme.colors.text.secondary,
  },
  infoSection: {
    backgroundColor: theme.colors.primary.blue + '10',
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  infoText: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
    lineHeight: 18,
    textAlign: 'center',
  },
});