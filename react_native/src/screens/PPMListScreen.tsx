import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  Modal,
  Pressable,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Header } from '../components/Header';
import { Card, SectionHeader, PPMStatusBadge } from '../components/Shared';
import { COLORS } from '../constants/theme';
import {
  getPpmAppointments,
  getPpmAppointmentById,
  confirmPpmSchedule,
  requestNewPpmDates,
  type PPMAppointment,
} from '../api/ppmApi';

const PPM_FILTER_STATUSES = ['All', 'CONFIRMED', 'RESCHEDULE_REQUESTED', 'SCHEDULED'] as const;
type PPMFilterTab = (typeof PPM_FILTER_STATUSES)[number];

const PENDING_STATUSES = ['PROPOSED', 'SCHEDULED', 'PENDING_CONFIRMATION', 'ACTIVE', 'OPEN', 'open', 'proposed', 'scheduled', 'pending_confirmation', 'active'];

function formatDate(s: string | null | undefined): string {
  if (!s) return '-';
  try {
    const d = new Date(s);
    return isNaN(d.getTime()) ? String(s) : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return String(s);
  }
}

function isPendingStatus(status: string | undefined): boolean {
  if (!status) return true;
  const lower = status.toLowerCase();
  return PENDING_STATUSES.includes(status) || ['proposed', 'scheduled', 'pending_confirmation', 'active', 'open'].includes(lower);
}

interface PPMListScreenProps {
  onBack: () => void;
}

export function PPMListScreen({ onBack }: PPMListScreenProps) {
  const [view, setView] = useState<'list' | 'detail' | 'request_dates'>('list');
  const [activeTab, setActiveTab] = useState<PPMFilterTab>('All');
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<PPMAppointment[]>([]);
  const [selected, setSelected] = useState<PPMAppointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [successAction, setSuccessAction] = useState<'confirm' | 'request' | null>(null);
  const [proposedDate, setProposedDate] = useState('');
  const [proposedTime, setProposedTime] = useState('');
  const [requestReason, setRequestReason] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ date?: string; time?: string; reason?: string }>({});
  const [refreshing, setRefreshing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [timePickerHour, setTimePickerHour] = useState(9);
  const [timePickerMinute, setTimePickerMinute] = useState(0);
  const [timePickerAm, setTimePickerAm] = useState(true);

  const fetchList = useCallback(async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const status = activeTab === 'All' ? undefined : activeTab;
      const res = await getPpmAppointments({ page: p, limit: 10, status });
      const data = (res as { data?: PPMAppointment[] }).data ?? [];
      setItems(Array.isArray(data) ? data : []);
      const pages = (res as { pages?: number }).pages ?? 1;
      setTotalPages(pages);
    } catch {
      setItems([]);
      setError('Failed to load PPM schedules');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchList(1);
    setPage(1);
  }, [activeTab]);

  useEffect(() => {
    fetchList(page);
  }, [page]);

  const filtered = items.filter((r) => {
    const searchLower = search.toLowerCase();
    const assetName = r.Asset?.name ?? r.asset_id ?? '';
    const techName = r.technician?.full_name ?? '';
    return !searchLower || assetName.toLowerCase().includes(searchLower) || techName.toLowerCase().includes(searchLower) || (r.pm_schedule_id || '').toLowerCase().includes(searchLower);
  });

  const openDetail = useCallback(async (item: PPMAppointment) => {
    setView('detail');
    setSelected(item);
    setDetailLoading(true);
    const id = item.pm_schedule_id || (item as { appointment_id?: string }).appointment_id;
    if (id) {
      const res = await getPpmAppointmentById(id);
      setDetailLoading(false);
      if (res.success !== false && res.data) setSelected(res.data);
      else if (res.data) setSelected(res.data as PPMAppointment);
    } else {
      setDetailLoading(false);
    }
  }, []);

  const refreshList = useCallback(async () => {
    setRefreshing(true);
    setError('');
    try {
      const status = activeTab === 'All' ? undefined : activeTab;
      const res = await getPpmAppointments({ page, limit: 10, status });
      const data = (res as { data?: PPMAppointment[] }).data ?? [];
      setItems(Array.isArray(data) ? data : []);
      const pages = (res as { pages?: number }).pages ?? 1;
      setTotalPages(pages);
    } catch {
      setItems([]);
      setError('Failed to load PPM schedules');
    } finally {
      setRefreshing(false);
    }
  }, [activeTab, page]);

  const goBackToList = useCallback(() => {
    setView('list');
    setSelected(null);
    setSuccessAction(null);
    setActionError('');
    setProposedDate('');
    setProposedTime('');
    setRequestReason('');
    refreshList();
  }, [refreshList]);

  const handleConfirm = useCallback(async () => {
    if (!selected) return;
    const id = selected.pm_schedule_id || (selected as { appointment_id?: string }).appointment_id;
    if (!id) return;
    setSubmitting(true);
    setActionError('');
    const res = await confirmPpmSchedule(id);
    setSubmitting(false);
    if ((res as { success?: boolean }).success !== false && !(res as { message?: string }).message?.toLowerCase().includes('fail')) {
      setSuccessAction('confirm');
      if ((res as { data?: PPMAppointment }).data) setSelected((res as { data: PPMAppointment }).data);
    } else {
      setActionError((res as { message?: string }).message || 'Failed to confirm');
    }
  }, [selected]);

  const openRequestDates = useCallback(() => {
    setView('request_dates');
    setActionError('');
    setFieldErrors({});
    setProposedDate('');
    setProposedTime('');
    setRequestReason('');
    setShowDatePicker(false);
    setShowTimePicker(false);
    setCalendarMonth(new Date());
    setTimePickerHour(9);
    setTimePickerMinute(0);
    setTimePickerAm(true);
  }, []);

  const formatDateForDisplay = (d: Date): string => {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const isPastDate = useCallback((d: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dp = new Date(d);
    dp.setHours(0, 0, 0, 0);
    return dp.getTime() < today.getTime();
  }, []);

  const selectDate = useCallback((d: Date) => {
    if (isPastDate(d)) return;
    setProposedDate(formatDateForDisplay(d));
    setFieldErrors((e) => ({ ...e, date: undefined }));
    setShowDatePicker(false);
  }, [isPastDate]);

  const getCalendarDays = useCallback((year: number, month: number) => {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const startPad = first.getDay();
    const days: (Date | null)[] = [];
    for (let i = 0; i < startPad; i++) days.push(null);
    for (let d = 1; d <= last.getDate(); d++) days.push(new Date(year, month, d));
    return days;
  }, []);

  const formatTimeForDisplay = useCallback((h: number, m: number, am: boolean): string => {
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${am ? 'AM' : 'PM'}`;
  }, []);

  const selectTime = useCallback(() => {
    setProposedTime(formatTimeForDisplay(timePickerHour, timePickerMinute, timePickerAm));
    setFieldErrors((e) => ({ ...e, time: undefined }));
    setShowTimePicker(false);
  }, [timePickerHour, timePickerMinute, timePickerAm, formatTimeForDisplay]);

  const applyTimeFromProposed = useCallback(() => {
    const parsed = proposedTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (parsed) {
      const h = parseInt(parsed[1], 10);
      const min = Math.min(55, Math.floor((parseInt(parsed[2], 10) || 0) / 5) * 5);
      const isAm = (parsed[3] || '').toUpperCase() === 'AM';
      setTimePickerHour(h >= 1 && h <= 12 ? h : 9);
      setTimePickerMinute(min);
      setTimePickerAm(isAm);
    }
  }, [proposedTime]);

  const parseDateForApi = (s: string): string | undefined => {
    const t = s.trim();
    if (!t) return undefined;
    const ddmmyy = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyy) {
      const [, d, m, y] = ddmmyy;
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
    }
    const yyyymmdd = t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (yyyymmdd) return t;
    return undefined;
  };

  const parseTimeForApi = (s: string): string | undefined => {
    const t = s.trim();
    if (!t) return undefined;
    const hhmm = t.match(/^(\d{1,2}):(\d{2})(?:\s*(am|pm))?$/i);
    if (hhmm) {
      let h = parseInt(hhmm[1], 10);
      const m = hhmm[2];
      const ampm = (hhmm[3] || '').toLowerCase();
      if (ampm === 'pm' && h < 12) h += 12;
      if (ampm === 'am' && h === 12) h = 0;
      return `${String(h).padStart(2, '0')}:${m}`;
    }
    if (/^\d{1,2}:\d{2}$/.test(t)) return t.length === 4 ? `0${t}` : t;
    return undefined;
  };

  const handleSubmitRequest = useCallback(async () => {
    if (!selected) return;
    const id = selected.pm_schedule_id || (selected as { appointment_id?: string }).appointment_id;
    if (!id) return;

    const dateVal = parseDateForApi(proposedDate);
    const timeVal = parseTimeForApi(proposedTime);
    const reasonVal = requestReason.trim();

    const err: { date?: string; time?: string; reason?: string } = {};
    if (!dateVal) err.date = 'Proposed date is required (dd/mm/yyyy)';
    else {
      const [y, mo, d] = dateVal.split('-').map(Number);
      const picked = new Date(y, mo - 1, d);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      picked.setHours(0, 0, 0, 0);
      if (picked.getTime() < today.getTime()) err.date = 'Proposed date cannot be in the past';
    }
    if (!timeVal) err.time = 'Proposed time is required (e.g. 9:30 or 14:30)';
    if (!reasonVal) err.reason = 'Reason or comments is required';

    setFieldErrors(err);
    if (Object.keys(err).length > 0) return;

    setSubmitting(true);
    setActionError('');
    const res = await requestNewPpmDates(id, {
      reason: reasonVal,
      proposed_date: dateVal,
      proposed_time: timeVal,
    });
    setSubmitting(false);
    if ((res as { success?: boolean }).success !== false && !(res as { message?: string }).message?.toLowerCase().includes('fail')) {
      setSuccessAction('request');
      setView('detail');
      if (res.data) setSelected(res.data as PPMAppointment);
    } else {
      setActionError((res as { message?: string }).message || 'Failed to request new dates');
    }
  }, [selected, proposedDate, proposedTime, requestReason]);

  if (view === 'detail' && selected) {
    const id = selected.pm_schedule_id || (selected as { appointment_id?: string }).appointment_id;
    const asset = selected.Asset || { asset_id: selected.asset_id, name: selected.asset_id };
    const tech = selected.technician?.full_name || '-';
    const canConfirm = isPendingStatus(selected.status);
    const displayStatus = selected.status || 'Pending';

    if (successAction) {
      return (
        <View style={styles.container}>
          <Header title="PPM Schedule" showBack onBack={goBackToList} />
          <View style={styles.successWrap}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={48} color={COLORS.emerald[600]} />
            </View>
            <Text style={styles.successTitle}>
              {successAction === 'confirm' ? 'Schedule Confirmed' : 'Request Sent'}
            </Text>
            <Text style={styles.successDesc}>
              {successAction === 'confirm'
                ? `Maintenance for ${asset.name || asset.asset_id} is confirmed for ${formatDate(selected.next_due_date)}.`
                : 'Your request for new dates has been sent to the biomedical team.'}
            </Text>
            <TouchableOpacity style={styles.successBtn} onPress={goBackToList}>
              <Text style={styles.successBtnText}>Back to List</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <Header title="PPM Schedule Detail" showBack onBack={goBackToList} />
        {detailLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <Card style={styles.detailCard}>
              <View style={styles.detailHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailId}>{id}</Text>
                  <Text style={styles.detailTitle}>{asset.name || asset.asset_id}</Text>
                </View>
                <PPMStatusBadge status={displayStatus} />
              </View>
              <View style={styles.gridRow}>
                <View style={styles.gridCard}>
                  <Text style={styles.gridLabel}>Due Date</Text>
                  <Text style={styles.gridValue}>{formatDate(selected.next_due_date)}</Text>
                </View>
                <View style={styles.gridCard}>
                  <Text style={styles.gridLabel}>Assigned To</Text>
                  <Text style={styles.gridValue}>{tech}</Text>
                </View>
              </View>
              <View style={styles.gridRow}>
                <View style={styles.gridCard}>
                  <Text style={styles.gridLabel}>Type</Text>
                  <Text style={styles.gridValue}>{selected.maintenance_type || selected.service_type || 'PPM'}</Text>
                </View>
                <View style={styles.gridCard}>
                  <Text style={styles.gridLabel}>Last Completed</Text>
                  <Text style={styles.gridValue}>{formatDate(selected.last_completed_date) || '-'}</Text>
                </View>
              </View>
            </Card>
            {canConfirm && (
              <View style={styles.detailActions}>
                <TouchableOpacity
                  style={[styles.actionBtnPrimary, submitting && styles.actionBtnDisabled]}
                  onPress={handleConfirm}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator size="small" color={COLORS.white} />
                  ) : (
                    <Text style={styles.actionBtnPrimaryText}>Confirm Schedule</Text>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtnOutline, submitting && styles.actionBtnDisabled]}
                  onPress={openRequestDates}
                  disabled={submitting}
                >
                  <Text style={styles.actionBtnOutlineText}>Request Different Date</Text>
                </TouchableOpacity>
              </View>
            )}
            {actionError ? <Text style={styles.actionError}>{actionError}</Text> : null}
          </ScrollView>
        )}
      </View>
    );
  }

  if (view === 'request_dates') {
    return (
      <View style={styles.container}>
        <Header title="Request Different Time" showBack onBack={() => setView('detail')} />
        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <Text style={styles.formTitle}>Propose Alternative Slot</Text>
          <Text style={styles.formDesc}>Tell us when works best for your ward. We'll try our best to accommodate.</Text>
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>PROPOSED DATE</Text>
            {fieldErrors.date ? <Text style={styles.fieldError}>{fieldErrors.date}</Text> : null}
            <View style={[styles.inputRow, fieldErrors.date && styles.inputRowError]}>
              <TouchableOpacity onPress={() => !submitting && setShowDatePicker(true)} style={styles.iconTouch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="calendar-outline" size={18} color={COLORS.slate[400]} />
              </TouchableOpacity>
              <Pressable style={styles.fieldInput} onPress={() => !submitting && setShowDatePicker(true)}>
                <Text style={[styles.fieldInputText, !proposedDate && styles.fieldInputPlaceholder]}>
                  {proposedDate || 'dd/mm/yyyy'}
                </Text>
              </Pressable>
              <TouchableOpacity onPress={() => !submitting && setShowDatePicker(true)} style={styles.iconTouch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="calendar-outline" size={18} color={COLORS.slate[400]} />
              </TouchableOpacity>
            </View>
          </View>
          <Modal visible={showDatePicker} transparent animationType="fade">
            <Pressable style={styles.dateModalBackdrop} onPress={() => setShowDatePicker(false)}>
              <Pressable style={styles.dateModalContent} onPress={(e) => e.stopPropagation()}>
                <View style={styles.dateModalHeader}>
                  <TouchableOpacity onPress={() => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1))}>
                    <Ionicons name="chevron-back" size={24} color={COLORS.slate[700]} />
                  </TouchableOpacity>
                  <Text style={styles.dateModalTitle}>
                    {calendarMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </Text>
                  <TouchableOpacity onPress={() => setCalendarMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1))}>
                    <Ionicons name="chevron-forward" size={24} color={COLORS.slate[700]} />
                  </TouchableOpacity>
                </View>
                <View style={styles.calendarWeekdays}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                    <Text key={d} style={styles.calendarWeekday}>{d}</Text>
                  ))}
                </View>
                <View style={styles.calendarGrid}>
                  {getCalendarDays(calendarMonth.getFullYear(), calendarMonth.getMonth()).map((d, i) => (
                    d ? (
                      <TouchableOpacity
                        key={i}
                        style={[
                          styles.calendarDay,
                          proposedDate === formatDateForDisplay(d) && styles.calendarDaySelected,
                          isPastDate(d) && styles.calendarDayDisabled,
                        ]}
                        onPress={() => selectDate(d)}
                        disabled={isPastDate(d)}
                      >
                        <Text style={[
                          styles.calendarDayText,
                          proposedDate === formatDateForDisplay(d) && styles.calendarDayTextSelected,
                          isPastDate(d) && styles.calendarDayTextDisabled,
                        ]}>
                          {d.getDate()}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View key={i} style={styles.calendarDayEmpty} />
                    )
                  ))}
                </View>
                <TouchableOpacity style={styles.dateModalClose} onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.dateModalCloseText}>Close</Text>
                </TouchableOpacity>
              </Pressable>
            </Pressable>
          </Modal>
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>PROPOSED TIME</Text>
            {fieldErrors.time ? <Text style={styles.fieldError}>{fieldErrors.time}</Text> : null}
            <View style={[styles.inputRow, fieldErrors.time && styles.inputRowError]}>
              <TouchableOpacity onPress={() => { if (!submitting) { applyTimeFromProposed(); setShowTimePicker(true); } }} style={styles.iconTouch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="time-outline" size={18} color={COLORS.slate[400]} />
              </TouchableOpacity>
              <Pressable style={styles.fieldInput} onPress={() => { if (!submitting) { applyTimeFromProposed(); setShowTimePicker(true); } }}>
                <Text style={[styles.fieldInputText, !proposedTime && styles.fieldInputPlaceholder]}>
                  {proposedTime || '--:-- --'}
                </Text>
              </Pressable>
              <TouchableOpacity onPress={() => { if (!submitting) { applyTimeFromProposed(); setShowTimePicker(true); } }} style={styles.iconTouch} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Ionicons name="time-outline" size={18} color={COLORS.slate[400]} />
              </TouchableOpacity>
            </View>
          </View>
          <Modal visible={showTimePicker} transparent animationType="fade">
            <Pressable style={styles.dateModalBackdrop} onPress={() => setShowTimePicker(false)}>
              <Pressable style={styles.dateModalContent} onPress={(e) => e.stopPropagation()}>
                <Text style={styles.timeModalTitle}>Select Time</Text>
                <View style={styles.timePickerRow}>
                  <View style={styles.timePickerCol}>
                    <Text style={styles.timePickerLabel}>Hour</Text>
                    <ScrollView style={styles.timePickerScroll} showsVerticalScrollIndicator={false}>
                      {[12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((h) => (
                        <TouchableOpacity
                          key={h}
                          style={[styles.timePickerItem, timePickerHour === h && styles.timePickerItemSelected]}
                          onPress={() => setTimePickerHour(h)}
                        >
                          <Text style={[styles.timePickerItemText, timePickerHour === h && styles.timePickerItemTextSelected]}>{h}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                  <View style={styles.timePickerCol}>
                    <Text style={styles.timePickerLabel}>Min</Text>
                    <ScrollView style={styles.timePickerScroll} showsVerticalScrollIndicator={false}>
                      {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => (
                        <TouchableOpacity
                          key={m}
                          style={[styles.timePickerItem, timePickerMinute === m && styles.timePickerItemSelected]}
                          onPress={() => setTimePickerMinute(m)}
                        >
                          <Text style={[styles.timePickerItemText, timePickerMinute === m && styles.timePickerItemTextSelected]}>
                            {String(m).padStart(2, '0')}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                  <View style={styles.timePickerCol}>
                    <Text style={styles.timePickerLabel}>Period</Text>
                    <TouchableOpacity
                      style={[styles.timePickerItem, timePickerAm && styles.timePickerItemSelected]}
                      onPress={() => setTimePickerAm(true)}
                    >
                      <Text style={[styles.timePickerItemText, timePickerAm && styles.timePickerItemTextSelected]}>AM</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.timePickerItem, !timePickerAm && styles.timePickerItemSelected]}
                      onPress={() => setTimePickerAm(false)}
                    >
                      <Text style={[styles.timePickerItemText, !timePickerAm && styles.timePickerItemTextSelected]}>PM</Text>
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.timeModalActions}>
                  <TouchableOpacity style={styles.timeModalCancel} onPress={() => setShowTimePicker(false)}>
                    <Text style={styles.timeModalCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.timeModalOk} onPress={selectTime}>
                    <Text style={styles.timeModalOkText}>OK</Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            </Pressable>
          </Modal>
          <View style={styles.fieldWrap}>
            <Text style={styles.fieldLabel}>REASON / COMMENTS</Text>
            {fieldErrors.reason ? <Text style={styles.fieldError}>{fieldErrors.reason}</Text> : null}
            <TextInput
              style={[styles.fieldTextArea, fieldErrors.reason && styles.inputRowError]}
              placeholder="e.g. Ward busy during current slots, equipment needed for priority surgery..."
              placeholderTextColor={COLORS.slate[400]}
              value={requestReason}
              onChangeText={(t) => { setRequestReason(t); setFieldErrors((e) => ({ ...e, reason: undefined })); }}
              multiline
              numberOfLines={4}
              editable={!submitting}
            />
          </View>
          <View style={styles.warningBox}>
            <Ionicons name="warning-outline" size={20} color={COLORS.amber[600]} style={styles.warningIcon} />
            <Text style={styles.warningText}>Note: Emergency maintenance cannot be rescheduled. Rescheduling may affect device compliance status.</Text>
          </View>
          {actionError ? <Text style={styles.actionError}>{actionError}</Text> : null}
        </ScrollView>
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitBtn, submitting && styles.actionBtnDisabled]}
            onPress={handleSubmitRequest}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Text style={styles.submitBtnText}>Submit Request</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="PPM Schedules" showBack onBack={onBack} compact />
      <View style={styles.toolbar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabsScroll} contentContainerStyle={styles.tabsScrollContent}>
          <View style={styles.tabs}>
            {PPM_FILTER_STATUSES.map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.tab, activeTab === t && styles.tabActive]}
                onPress={() => setActiveTab(t)}
              >
                <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>
                  {t === 'All' ? 'All' : t.replace(/_/g, ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <View style={styles.searchWrap}>
        <Ionicons name="search-outline" size={16} color={COLORS.slate[400]} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by asset or person in charge..."
          placeholderTextColor={COLORS.slate[400]}
          value={search}
          onChangeText={setSearch}
        />
        </View>
      </View>
      {loading && !refreshing ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[styles.content, (error || filtered.length === 0) && styles.contentFlex]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refreshList} colors={[COLORS.sky[600]]} />
          }
        >
          {error ? (
            <View style={styles.empty}>
              <Ionicons name="alert-circle-outline" size={48} color={COLORS.slate[300]} />
              <Text style={styles.emptyText}>{error}</Text>
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="calendar-outline" size={48} color={COLORS.slate[200]} />
              <Text style={styles.emptyText}>No PPM schedules found</Text>
            </View>
          ) : (
          <>
          {filtered.map((r) => {
            const asset = r.Asset || { asset_id: r.asset_id, name: r.asset_id };
            const displayStatus = r.status || 'Pending';
            return (
              <Card
                key={r.pm_schedule_id || (r as { appointment_id?: string }).appointment_id || r.asset_id}
                onPress={() => openDetail(r)}
                style={styles.listCard}
                leftBorder={COLORS.sky[500]}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardId}>{r.pm_schedule_id || (r as { appointment_id?: string }).appointment_id || r.asset_id}</Text>
                  <PPMStatusBadge status={displayStatus} />
                </View>
                <Text style={styles.cardTitle}>{asset.name || asset.asset_id}</Text>
                <View style={styles.cardFooter}>
                  <View style={styles.cardMeta}>
                    <Ionicons name="time-outline" size={12} color={COLORS.slate[400]} />
                    <Text style={styles.cardMetaText}>Due {formatDate(r.next_due_date)}</Text>
                  </View>
                  <Text style={styles.cardTech}>Assigned to: {r.technician?.full_name || '-'}</Text>
                </View>
              </Card>
            );
          })}
          {filtered.length > 0 && totalPages > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity
                style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
                onPress={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                <Text style={styles.pageBtnText}>Previous</Text>
              </TouchableOpacity>
              <Text style={styles.pageInfo}>{page} / {totalPages}</Text>
              <TouchableOpacity
                style={[styles.pageBtn, page >= totalPages && styles.pageBtnDisabled]}
                onPress={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                <Text style={styles.pageBtnText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}
          </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.slate[50] },
  scroll: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  contentFlex: { flex: 1 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  toolbar: { backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.slate[100] },
  tabsScroll: { backgroundColor: 'transparent', height: 36 },
  tabsScrollContent: { flexGrow: 0, paddingVertical: 0, minHeight: 0, alignSelf: 'center' },
  tabs: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 6, paddingBottom: 4, gap: 6, alignItems: 'center' },
  tab: { paddingVertical: 5, paddingHorizontal: 14, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.slate[100] },
  tabActive: { backgroundColor: COLORS.sky[600], borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 10, fontWeight: '700', letterSpacing: 1, color: COLORS.slate[500] },
  tabTextActive: { color: COLORS.white },
  searchWrap: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingTop: 4, paddingBottom: 8, backgroundColor: 'transparent' },
  searchIcon: { position: 'absolute', left: 28, zIndex: 1 },
  searchInput: { flex: 1, paddingLeft: 40, paddingRight: 16, paddingVertical: 10, backgroundColor: COLORS.slate[50], borderRadius: 12, fontSize: 14 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyText: { fontSize: 14, color: COLORS.slate[500], marginTop: 16, fontStyle: 'italic' },
  listCard: { marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  cardId: { fontSize: 10, fontWeight: '700', color: COLORS.slate[400], letterSpacing: 0.5, textTransform: 'uppercase' },
  cardTitle: { fontSize: 14, fontWeight: '700', color: COLORS.slate[800], marginBottom: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardMetaText: { fontSize: 10, color: COLORS.slate[400] },
  cardTech: { fontSize: 10, fontWeight: '600', color: COLORS.slate[600] },
  pagination: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, marginTop: 24 },
  pageBtn: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: COLORS.primary, borderRadius: 8 },
  pageBtnDisabled: { backgroundColor: COLORS.slate[300] },
  pageBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.white },
  pageInfo: { fontSize: 12, color: COLORS.slate[600] },
  detailCard: { marginBottom: 24 },
  detailHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  detailId: { fontSize: 10, fontWeight: '800', color: COLORS.slate[400], letterSpacing: 0.5, textTransform: 'uppercase' },
  detailTitle: { fontSize: 18, fontWeight: '700', color: COLORS.slate[900] },
  gridRow: { flexDirection: 'row', gap: 12 },
  gridCard: { flex: 1, padding: 12, borderWidth: 1, borderColor: COLORS.slate[100], borderRadius: 12, marginBottom: 12 },
  gridLabel: { fontSize: 10, fontWeight: '700', color: COLORS.slate[400], textTransform: 'uppercase', marginBottom: 4 },
  gridValue: { fontSize: 12, fontWeight: '700', color: COLORS.slate[800] },
  detailActions: { gap: 12 },
  actionBtnPrimary: { paddingVertical: 14, backgroundColor: COLORS.sky[600], borderRadius: 12, alignItems: 'center' },
  actionBtnPrimaryText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
  actionBtnOutline: { paddingVertical: 14, backgroundColor: COLORS.white, borderWidth: 2, borderColor: COLORS.sky[600], borderRadius: 12, alignItems: 'center' },
  actionBtnOutlineText: { fontSize: 14, fontWeight: '700', color: COLORS.sky[600] },
  actionBtnDisabled: { opacity: 0.7 },
  actionError: { fontSize: 12, color: COLORS.danger, marginTop: 12 },
  formTitle: { fontSize: 16, fontWeight: '700', color: COLORS.slate[900], marginBottom: 4 },
  formDesc: { fontSize: 13, color: COLORS.slate[500], marginBottom: 20 },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { fontSize: 10, fontWeight: '700', color: COLORS.slate[500], letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' },
  fieldError: { fontSize: 12, color: COLORS.danger, marginBottom: 6 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.slate[200], borderRadius: 12 },
  inputRowError: { borderColor: COLORS.danger },
  iconTouch: { padding: 12 },
  inputIcon: { marginLeft: 14 },
  inputIconRight: { marginRight: 14 },
  fieldInput: { flex: 1, paddingVertical: 14, paddingHorizontal: 12, justifyContent: 'center' },
  fieldInputText: { fontSize: 14, color: COLORS.slate[900] },
  fieldInputPlaceholder: { color: COLORS.slate[400] },
  dateModalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
  dateModalContent: { backgroundColor: COLORS.white, borderRadius: 16, padding: 20 },
  dateModalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  dateModalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.slate[900] },
  dateModalClose: { marginTop: 16, paddingVertical: 12, alignItems: 'center', borderTopWidth: 1, borderTopColor: COLORS.slate[200] },
  dateModalCloseText: { fontSize: 14, fontWeight: '600', color: COLORS.sky[600] },
  calendarWeekdays: { flexDirection: 'row', marginBottom: 8 },
  calendarWeekday: { flex: 1, textAlign: 'center', fontSize: 10, fontWeight: '700', color: COLORS.slate[500], textTransform: 'uppercase' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  calendarDay: { width: '14.28%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  calendarDayEmpty: { width: '14.28%', aspectRatio: 1 },
  calendarDaySelected: { backgroundColor: COLORS.sky[600] },
  calendarDayText: { fontSize: 14, fontWeight: '600', color: COLORS.slate[800] },
  calendarDayTextSelected: { color: COLORS.white },
  calendarDayDisabled: { opacity: 0.4 },
  calendarDayTextDisabled: { color: COLORS.slate[400] },
  timeModalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.slate[900], marginBottom: 16, textAlign: 'center' },
  timePickerRow: { flexDirection: 'row', gap: 16 },
  timePickerCol: { flex: 1, alignItems: 'center' },
  timePickerLabel: { fontSize: 10, fontWeight: '700', color: COLORS.slate[500], marginBottom: 8, textTransform: 'uppercase' },
  timePickerScroll: { maxHeight: 140 },
  timePickerItem: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8, marginBottom: 4 },
  timePickerItemSelected: { backgroundColor: COLORS.sky[600] },
  timePickerItemText: { fontSize: 14, fontWeight: '600', color: COLORS.slate[800] },
  timePickerItemTextSelected: { color: COLORS.white },
  timeModalActions: { flexDirection: 'row', gap: 12, marginTop: 20, borderTopWidth: 1, borderTopColor: COLORS.slate[200], paddingTop: 16 },
  timeModalCancel: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: COLORS.slate[100], borderRadius: 12 },
  timeModalCancelText: { fontSize: 14, fontWeight: '600', color: COLORS.slate[600] },
  timeModalOk: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: COLORS.sky[600], borderRadius: 12 },
  timeModalOkText: { fontSize: 14, fontWeight: '600', color: COLORS.white },
  fieldTextArea: { padding: 14, backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.slate[200], borderRadius: 12, fontSize: 14, minHeight: 100, textAlignVertical: 'top' },
  warningBox: { flexDirection: 'row', alignItems: 'flex-start', padding: 12, backgroundColor: COLORS.amber[50], borderWidth: 1, borderColor: COLORS.amber[100], borderRadius: 12, marginTop: 8 },
  warningIcon: { marginRight: 10, marginTop: 1 },
  warningText: { flex: 1, fontSize: 11, color: COLORS.amber[800], lineHeight: 16 },
  footer: { padding: 16, backgroundColor: COLORS.white, borderTopWidth: 1, borderTopColor: COLORS.slate[200] },
  submitBtn: { paddingVertical: 16, backgroundColor: COLORS.sky[600], borderRadius: 16, alignItems: 'center' },
  submitBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
  successWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  successIcon: { marginBottom: 24 },
  successTitle: { fontSize: 22, fontWeight: '800', color: COLORS.slate[900], marginBottom: 12, textAlign: 'center' },
  successDesc: { fontSize: 14, color: COLORS.slate[500], textAlign: 'center', marginBottom: 32 },
  successBtn: { paddingHorizontal: 32, paddingVertical: 16, backgroundColor: COLORS.slate[900], borderRadius: 16 },
  successBtnText: { fontSize: 14, fontWeight: '700', color: COLORS.white },
});
