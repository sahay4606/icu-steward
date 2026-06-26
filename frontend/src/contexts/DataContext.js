import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import { createApiClient } from '../lib/api';
import { API_BASE_URL, ACTIVE_HOSPITAL_ID } from '../lib/config';
import { normalizeKeys } from '../lib/format';

const api = createApiClient(API_BASE_URL);
const DataContext = createContext(null);

export function DataProvider({ children }) {
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
    dashboardSummary: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [hospital, patients, investigations, antibiotics, devices, tasks, notifications, users, reminderRules] =
        await Promise.all([
          api.getHospitalSettings(ACTIVE_HOSPITAL_ID),
          api.getPatients(ACTIVE_HOSPITAL_ID),
          api.getInvestigations(ACTIVE_HOSPITAL_ID),
          api.getAntibiotics(ACTIVE_HOSPITAL_ID),
          api.getDevices(ACTIVE_HOSPITAL_ID),
          api.getTasks(ACTIVE_HOSPITAL_ID),
          api.getNotifications(ACTIVE_HOSPITAL_ID),
          api.getUsers(ACTIVE_HOSPITAL_ID),
          api.getReminderRules(ACTIVE_HOSPITAL_ID),
        ]);

      const dashboard = await api.getDashboard(ACTIVE_HOSPITAL_ID).catch(() => null);
      const patientIds = (patients || []).map((p) => p.id);
      const allTimeline = [];
      for (const pid of patientIds.slice(0, 3)) {
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
        dashboardSummary: normalizeKeys(dashboard),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [patients, investigations, antibiotics, devices, tasks, notifications] = await Promise.all([
        api.getPatients(ACTIVE_HOSPITAL_ID),
        api.getInvestigations(ACTIVE_HOSPITAL_ID),
        api.getAntibiotics(ACTIVE_HOSPITAL_ID),
        api.getDevices(ACTIVE_HOSPITAL_ID),
        api.getTasks(ACTIVE_HOSPITAL_ID),
        api.getNotifications(ACTIVE_HOSPITAL_ID),
      ]);
      setData((prev) => ({
        ...prev,
        patients: normalizeKeys(patients || []),
        investigations: normalizeKeys(investigations || []),
        antibiotics: normalizeKeys(antibiotics || []),
        devices: normalizeKeys(devices || []),
        tasks: normalizeKeys(tasks || []),
        notifications: normalizeKeys(notifications || []),
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const triggerRefetch = useCallback(() => {
    refetchAll().catch(() => {});
  }, [refetchAll]);

  const createEntity = useCallback(async (endpoint, body) => {
    const result = await api.post(endpoint, body);
    triggerRefetch();
    return normalizeKeys(result);
  }, [triggerRefetch]);

  const updateEntity = useCallback(async (endpoint, body) => {
    const result = await api.patch(endpoint, body);
    triggerRefetch();
    return normalizeKeys(result);
  }, [triggerRefetch]);

  const removeEntity = useCallback(async (endpoint) => {
    await api.delete(endpoint);
    triggerRefetch();
  }, [triggerRefetch]);

  const value = useMemo(() => ({
    ...data,
    api,
    loading,
    error,
    hospitalId: ACTIVE_HOSPITAL_ID,
    getPatientById: (id) => data.patients.find((p) => p.id === id),
    getInvestigationsByPatient: (patientId) => data.investigations.filter((i) => i.patientId === patientId),
    getAntibioticsByPatient: (patientId) => data.antibiotics.filter((a) => a.patientId === patientId),
    getDevicesByPatient: (patientId) => data.devices.filter((d) => d.patientId === patientId),
    getTimelineByPatient: (patientId) => data.timelineEvents.filter((t) => t.patientId === patientId),
    getNotificationsByPatient: (patientId) => data.notifications.filter((n) => n.patientId === patientId),
    refetchAll,
    createPatient: (body) => createEntity('/api/patients', { ...body, hospital_id: ACTIVE_HOSPITAL_ID }),
    updatePatient: (id, body) => updateEntity(`/api/patients/${id}`, body),
    deletePatient: (id) => removeEntity(`/api/patients/${id}`),
    createInvestigation: (body) => createEntity('/api/investigations', { ...body, hospital_id: ACTIVE_HOSPITAL_ID }),
    updateInvestigation: (id, body) => updateEntity(`/api/investigations/${id}`, body),
    createAntibiotic: (body) => createEntity('/api/antibiotics', { ...body, hospital_id: ACTIVE_HOSPITAL_ID }),
    updateAntibiotic: (id, body) => updateEntity(`/api/antibiotics/${id}`, body),
    createTask: (body) => createEntity('/api/tasks', { ...body, hospital_id: ACTIVE_HOSPITAL_ID }),
    updateTask: (id, body) => updateEntity(`/api/tasks/${id}`, body),
    acknowledgeNotification: (id) => updateEntity(`/api/notifications/${id}`, { acknowledged: true }),
  }), [data, loading, error, refetchAll, createEntity, updateEntity, removeEntity]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
}
