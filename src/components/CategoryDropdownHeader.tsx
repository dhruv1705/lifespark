import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { theme } from '../theme';
import { Database } from '../lib/database.types';

type Category = Database['public']['Tables']['categories']['Row'];

interface CategoryDropdownHeaderProps {
  categories: Category[];
  selectedCategory?: Category;
  onSelectCategory: (category: Category) => void;
  onMenuPress?: () => void;
}

export const CategoryDropdownHeader: React.FC<CategoryDropdownHeaderProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  onMenuPress,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleCategorySelect = (category: Category) => {
    onSelectCategory(category);
    setIsDropdownOpen(false);
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.dropdownItem,
        selectedCategory?.id === item.id && styles.selectedItem
      ]}
      onPress={() => handleCategorySelect(item)}
    >
      <Text style={styles.categoryEmoji}>{item.emoji}</Text>
      <View style={styles.categoryInfo}>
        <Text style={[
          styles.categoryName,
          selectedCategory?.id === item.id && styles.selectedText
        ]}>
          {item.name}
        </Text>
        <Text style={[
          styles.categoryDescription,
          selectedCategory?.id === item.id && styles.selectedDescriptionText
        ]}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <>
      <TouchableOpacity 
        style={styles.container}
        onPress={() => setIsDropdownOpen(true)}
        activeOpacity={0.8}
      >
        <View style={styles.content}>
          <View style={styles.categoryDisplay}>
            <Text style={styles.selectedEmoji}>
              {selectedCategory?.emoji || '📱'}
            </Text>
            <Text style={styles.title}>
              {selectedCategory?.name || 'Choose your life area'}
            </Text>
          </View>
          
          <View style={styles.dropdownIcon}>
            <Text style={styles.dropdownArrow}>▼</Text>
          </View>
        </View>
        
        {onMenuPress && (
          <TouchableOpacity style={styles.menuButton} onPress={onMenuPress}>
            <View style={styles.menuIcon}>
              <View style={styles.menuLine} />
              <View style={styles.menuLine} />
              <View style={styles.menuLine} />
            </View>
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      <Modal
        visible={isDropdownOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDropdownOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsDropdownOpen(false)}
        >
          <View style={styles.dropdownContainer}>
            <Text style={styles.dropdownTitle}>Choose Your Life Area</Text>
            <FlatList
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              style={styles.dropdownList}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.primary.green,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...theme.shadows.sm,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectedEmoji: {
    fontSize: 24,
    marginRight: theme.spacing.sm,
  },
  title: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.inverse,
    lineHeight: 20,
    flex: 1,
  },
  dropdownIcon: {
    marginLeft: theme.spacing.sm,
  },
  dropdownArrow: {
    fontSize: 12,
    color: theme.colors.text.inverse,
    opacity: 0.8,
  },
  menuButton: {
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginLeft: theme.spacing.sm,
  },
  menuIcon: {
    width: 18,
    height: 14,
    justifyContent: 'space-between',
  },
  menuLine: {
    height: 2,
    backgroundColor: theme.colors.text.inverse,
    borderRadius: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginHorizontal: theme.spacing.lg,
    maxHeight: '70%',
    width: '85%',
    ...theme.shadows.lg,
  },
  dropdownTitle: {
    fontSize: theme.typography.sizes.lg,
    fontWeight: theme.typography.weights.bold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  dropdownList: {
    maxHeight: 400,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  selectedItem: {
    backgroundColor: theme.colors.primary.green + '10',
  },
  categoryEmoji: {
    fontSize: 28,
    marginRight: theme.spacing.md,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: theme.typography.sizes.md,
    fontWeight: theme.typography.weights.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  selectedText: {
    color: theme.colors.primary.green,
  },
  categoryDescription: {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.text.secondary,
  },
  selectedDescriptionText: {
    color: theme.colors.primary.green,
    opacity: 0.8,
  },
});