import React, { useState } from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';

const ProfileAvatar = ({ 
  name, 
  image, 
  style,
  size = 'md'
}) => {
  const [isPressed, setIsPressed] = useState(false);
  
  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const sizeStyles = {
    sm: { width: 40, height: 40, fontSize: 14 },
    md: { width: 64, height: 64, fontSize: 18 },
    lg: { width: 96, height: 96, fontSize: 24 }
  };

  const renderAvatar = () => {
    if (image) {
      return (
        <Image
          source={{ uri: image }}
          style={[
            styles.avatar,
            sizeStyles[size]
          ]}
        />
      );
    }

    return (
      <View style={[
        styles.avatarFallback,
        sizeStyles[size],
        { backgroundColor: '#007AFF' }
      ]}>
        <Text style={[
          styles.fallbackText,
          { fontSize: sizeStyles[size].fontSize }
        ]}>
          {getInitials(name)}
        </Text>
      </View>
    );
  };

  return (
    <Pressable 
      style={[styles.container, style]}
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
    >
      {renderAvatar()}
      {isPressed && (
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>Change</Text>
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatar: {
    borderRadius: 9999,
  },
  avatarFallback: {
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackText: {
    color: '#fff',
    fontWeight: '500',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayText: {
    color: '#fff',
    fontSize: 12,
  }
});

export default ProfileAvatar;