import React from 'react';
import {
  StyleSheet,
  Text as RNText,
  TextInput as RNTextInput,
  type TextProps,
  type TextInputProps,
} from 'react-native';

const FONT_REGULAR = 'PlusJakartaSans_400Regular';
const FONT_BOLD = 'PlusJakartaSans_700Bold';
const DEFAULT_FONT_STYLE = { fontFamily: FONT_REGULAR };

const originalCreate = StyleSheet.create.bind(StyleSheet);
(StyleSheet as { create: typeof StyleSheet.create }).create = function (obj: Record<string, object>) {
  const next: Record<string, object> = {};
  for (const k of Object.keys(obj)) {
    const v = obj[k] as Record<string, unknown>;
    if (
      v &&
      typeof v === 'object' &&
      !Array.isArray(v) &&
      'fontSize' in v &&
      !('fontFamily' in v)
    ) {
      const fw = v.fontWeight;
      const useBold =
        fw === '700' || fw === '800' || fw === '900' ||
        (typeof fw === 'number' && fw >= 700);
      next[k] = { ...v, fontFamily: useBold ? FONT_BOLD : FONT_REGULAR };
    } else {
      next[k] = obj[k];
    }
  }
  return originalCreate(next);
};

function mergeFontStyle(style: TextProps['style']): TextProps['style'] {
  if (style == null) return DEFAULT_FONT_STYLE;
  if (Array.isArray(style)) return [...style, DEFAULT_FONT_STYLE];
  return [style, DEFAULT_FONT_STYLE];
}

const RN = require('react-native') as typeof import('react-native');

RN.Text = function PatchedText(props: TextProps) {
  return React.createElement(RNText, {
    ...props,
    style: mergeFontStyle(props.style),
  });
} as typeof RNText;
(RN.Text as React.ComponentType<TextProps>).displayName = 'Text';

RN.TextInput = function PatchedTextInput(props: TextInputProps) {
  return React.createElement(RNTextInput, {
    ...props,
    style: mergeFontStyle(props.style),
  });
} as typeof RNTextInput;
(RN.TextInput as React.ComponentType<TextInputProps>).displayName = 'TextInput';
