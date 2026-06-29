import React, { createContext, useContext, useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { createApiClient } from '../lib/api';
import { API_BASE_URL } from '../lib/config';
import { normalizeKeys } from '../lib/format';
import { useAuth } from './AuthContext';

const api = createApiClient(API_BASE_URL);
const DataContext = createContext(null);

export function DataProvider({ children }) {
  const { user } = useAuth();
  const activeHospitalId = user?.hospital_id;

  const [data, setData] = useState({
    hospital: null,
    patients: [],
    investigations: [],
    antibiotics: [],
    devices: [],
    tasks: [],
    notifications: [],
    users: [],
    timelineEvents: [],
    reminderRules: [],
    cultures: [],
    dashboardSummary: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mutatingCount = useRef(0);
  const [isMutating, setIsMutating] = useState(false);
  const isEditing = useRef(false);

  const setEditing = useCallback((value) => {
    isEditing.current = !!value;
  }, []);

  const wrapMutation = useCallback((fn) => async (...args) => {
    mutatingCount.current += 1;
    setIsMutating(true);
    try {
      const result = await fn(...args);
      return result;
    } finally {
      mutatingCount.current -= 1;
      if (mutatingCount.current === 0) setIsMutating(false);
    }
  }, []);

  const load = useCallback(async () => {
    if (!activeHospitalId) return;
    try {
      setLoading(true);
      const [hospital, patients, investigations, antibiotics, devices, tasks, notifications, users, reminderRules, cultures] =
        await Promise.all([
          api.getHospitalSettings(activeHospitalId),
          api.getPatients(activeHospitalId),
          api.getInvestigations(activeHospitalId),
          api.getAntibiotics(activeHospitalId),
          api.getDevices(activeHospitalId),
          api.getTasks(activeHospitalId),
          api.getNotifications(activeHospitalId),
          api.getUsers(activeHospitalId),
          api.getReminderRules(activeHospitalId),
          api.getCultures(activeHospitalId),
        ]);

      const dashboard = await api.getDashboard(activeHospitalId).catch(() => null);
      const patientIds = (patients || []).map((p) => p.id);
      const allTimeline = [];
      for (const pid of patientIds) {
        const tl = await api.getTimelineEvents(pid).catch(() => []);
        allTimeline.push(...(tl || []));
      }

      setData({
        hospital: normalizeKeys(hospital),
        patients: normalizeKeys(patients || []),
        investigations: normalizeKeys(investigations || []),
        antibiotics: normalizeKeys(antibiotics || []),
        devices: normalizeKeys(devices || []),
        tasks: normalizeKeys(tasks || []),
        notifications: normalizeKeys(notifications || []),
        users: normalizeKeys(users || []),
        timelineEvents: normalizeKeys(allTimeline),
        reminderRules: normalizeKeys(reminderRules || []),
        cultures: normalizeKeys(cultures || []),
        dashboardSummary: normalizeKeys(dashboard),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeHospitalId]);

  useEffect(() => {
    if (activeHospitalId) {
      load();
    }
  }, [load, activeHospitalId]);

  const refetchAll = useCallback(async (extraPatientIds = []) => {
    if (!activeHospitalId) return;
    // Skip background refetch when user is actively editing a form
    if (isEditing.current) return;
    setLoading(true);
    try {
      const [patients, investigations, antibiotics, devices, tasks, notifications, cultures] = await Promise.all([
        api.getPatients(activeHospitalId),
        api.getInvestigations(activeHospitalId),
        api.getAntibiotics(activeHospitalId),
        api.getDevices(activeHospitalId),
        api.getTasks(activeHospitalId),
        api.getNotifications(activeHospitalId),
        api.getCultures(activeHospitalId),
      ]);
      const pIds = [...new Set([...(patients || []).map((p) => p.id), ...extraPatientIds])];
      const allTimeline = [];
      for (const pid of pIds) {
        const tl = await api.getTimelineEvents(pid).catch(() => []);
        allTimeline.push(...(tl || []));
      }
      const dashboard = await api.getDashboard(activeHospitalId).catch(() => null);
      const hospital = await api.getHospitalSettings(activeHospitalId).catch(() => null);
      setData((prev) => ({
        ...prev,
        hospital: hospital ? normalizeKeys(hospital) : prev.hospital,
        patients: normalizeKeys(patients || []),
        investigations: normalizeKeys(investigations || []),
        antibiotics: normalizeKeys(antibiotics || []),
        devices: normalizeKeys(devices || []),
        tasks: normalizeKeys(tasks || []),
        notifications: normalizeKeys(notifications || []),
        cultures: normalizeKeys(cultures || []),
        timelineEvents: normalizeKeys(allTimeline),
        dashboardSummary: normalizeKeys(dashboard),
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeHospitalId]);

  const triggerRefetch = useCallback((extraPatientIds = []) => {
    refetchAll(extraPatientIds).catch(() => {});
  }, [refetchAll]);

  const createEntity = useCallback(wrapMutation(async (endpoint, body) => {
    const result = await api.post(endpoint, body);
    triggerRefetch();
    return normalizeKeys(result);
  }), [triggerRefetch, wrapMutation]);

  const updateEntity = useCallback(wrapMutation(async (endpoint, body) => {
    const result = await api.patch(endpoint, body);
    triggerRefetch();
    return normalizeKeys(result);
  }), [triggerRefetch, wrapMutation]);

  const removeEntity = useCallback(wrapMutation(async (endpoint) => {
    await api.delete(endpoint);
    triggerRefetch();
  }), [triggerRefetch, wrapMutation]);

  const updateHospitalSettings = useCallback(wrapMutation(async (body) => {
    if (!activeHospitalId) return;
    const result = await api.updateHospitalSettings(activeHospitalId, body);
    const normalized = normalizeKeys(result);
    setData((prev) => ({ ...prev, hospital: normalized }));
    triggerRefetch();
    return normalized;
  }), [activeHospitalId, triggerRefetch, wrapMutation]);

  const value = useMemo(() => ({
    ...data,
    api,
    loading,
    mutating: isMutating,
    error,
    hospitalId: activeHospitalId,
    currentUserId: user?.id,
    currentUserName: user?.name,
    setEditing,
    getPatientById: (id) => data.patients.find((p) => p.id === id),
    getInvestigationsByPatient: (patientId) => data.investigations.filter((i) => i.patientId === patientId),
    getAntibioticsByPatient: (patientId) => data.antibiotics.filter((a) => a.patientId === patientId),
    getDevicesByPatient: (patientId) => data.devices.filter((d) => d.patientId === patientId),
    getTimelineByPatient: (patientId) => data.timelineEvents.filter((t) => t.patientId === patientId),
    getNotificationsByPatient: (patientId) => data.notifications.filter((n) => n.patientId === patientId),
    getCulturesByPatient: (patientId) => data.cultures.filter((c) => c.patientId === patientId),
    refetchAll,
    updateHospitalSettings,
    createPatient: (body) => createEntity('/api/patients', { ...body, hospital_id: activeHospitalId }),
    updatePatient: (id, body) => updateEntity(`/api/patients/${id}`, body),
    deletePatient: (id) => removeEntity(`/api/patients/${id}`),
    createInvestigation: (body) => createEntity('/api/investigations', { ...body, hospital_id: activeHospitalId }),
    updateInvestigation: (id, body) => updateEntity(`/api/investigations/${id}`, body),
    deleteInvestigation: (id) => removeEntity(`/api/investigations/${id}`),
    createAntibiotic: (body) => createEntity('/api/antibiotics', { ...body, hospital_id: activeHospitalId }),
    updateAntibiotic: (id, body) => updateEntity(`/api/antibiotics/${id}`, body),
    deleteAntibiotic: (id) => removeEntity(`/api/antibiotics/${id}`),
    createTask: (body) => createEntity('/api/tasks', { ...body, hospital_id: activeHospitalId }),
    updateTask: (id, body) => updateEntity(`/api/tasks/${id}`, body),
    acknowledgeNotification: (id) => updateEntity(`/api/notifications/${id}`, { acknowledged: true }),
    createDevice: (body) => createEntity('/api/devices', { ...body, hospital_id: activeHospitalId }),
    updateDevice: (id, body) => updateEntity(`/api/devices/${id}`, body),
    deleteDevice: (id) => removeEntity(`/api/devices/${id}`),
    createTimelineEvent: (body) => createEntity('/api/timeline-events', {
      ...body,
      hospital_id: activeHospitalId,
      performed_by: user?.id,
      performed_by_name: user?.name || '',
    }),
    createCulture: (body) => createEntity('/api/cultures', { ...body, hospital_id: activeHospitalId }),
    updateCulture: (id, body) => updateEntity(`/api/cultures/${id}`, body),
    deleteCulture: (id) => removeEntity(`/api/cultures/${id}`),
    getCultureFull: async (id) => { const r = await api.getCultureFull(id); return normalizeKeys(r); },
    getLinkedCultures: async (antibioticId) => { const r = await api.getLinkedCultures(antibioticId); return normalizeKeys(r); },
    linkCulture: async (antibioticId, cultureId, reason) => {
      const r = await api.linkCulture(antibioticId, cultureId, reason, user?.id);
      triggerRefetch();
      return normalizeKeys(r);
    },
    unlinkCulture: async (linkId) => { await api.unlinkCulture(linkId); triggerRefetch(); },
  }), [data, loading, error, activeHospitalId, refetchAll, createEntity, updateEntity, removeEntity, triggerRefetch, updateHospitalSettings, setEditing]);

  // ── Reminder scheduler: checks every 10s for entities with a reminder_at in the past ──
  const firedRef = useRef(new Set());
  useEffect(() => {
    if (!activeHospitalId) return;
    const checkReminders = async () => {
      try {
        const now = new Date().toISOString();
        const [antibiotics, investigations, devices, tasks] = await Promise.all([
          api.getAntibiotics(activeHospitalId),
          api.getInvestigations(activeHospitalId),
          api.getDevices(activeHospitalId),
          api.getTasks(activeHospitalId),
        ]);
        const due = [];
        const fired = firedRef.current;
        const check = (list, type, idField, titleField, patientIdField) => {
          for (const item of list || []) {
            const reminderAt = item.reminder_at || item.custom_alert_at || item.review_date || item.expected_report_date || item.review_reminder || item.due;
            if (!reminderAt || reminderAt > now) continue;
            const key = `${type}_${item[idField]}`;
            if (fired.has(key)) continue;
            due.push({
              key,
              body: {
                type,
                title: item.custom_alert_message || `${type.replace(/_/g, ' ')}: ${item[titleField] || ''}`,
                patient_id: item[patientIdField],
                hospital_id: activeHospitalId,
                acknowledged: false,
                created_at: now,
              },
            });
          }
        };
        check(antibiotics, 'antibiotic_reminder', 'id', 'drug_name', 'patient_id');
        check(investigations, 'investigation_reminder', 'id', 'name', 'patient_id');
        check(devices, 'device_reminder', 'id', 'type', 'patient_id');
        check(tasks, 'task_reminder', 'id', 'title', 'patient_id');
        for (const { key, body } of due) {
          try {
            await api.post('/api/notifications', body);
            fired.add(key);
          } catch (e) { /* skip */ }
        }
        if (due.length > 0) refetchAll();
      } catch (e) { /* skip cycle */ }
    };
    const interval = setInterval(checkReminders, 10000);
    return () => clearInterval(interval);
  }, [activeHospitalId, refetchAll]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
}

