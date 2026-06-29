/**
 * Centralized timeline event builder.
 * Use this to construct consistent timeline event payloads before calling createTimelineEvent.
 */

/**
 * Build a timeline event payload.
 * @param {object} opts
 * @param {string} opts.patientId - The patient this event is for
 * @param {string} opts.type - Event type (e.g. 'antibiotic_started', 'device_removed')
 * @param {string} opts.title - Human-readable title
 * @param {string} [opts.description] - Optional longer description
 * @param {string} [opts.oldValue] - Previous value (for edits)
 * @param {string} [opts.newValue] - New value (for edits)
 * @param {string} [opts.performedByName] - Doctor name (auto-injected by DataContext, but can be overridden)
 * @returns {object} Timeline event payload ready for createTimelineEvent
 */
export function buildTimelineEvent({
  patientId,
  type,
  title,
  description,
  oldValue,
  newValue,
  performedByName,
}) {
  const event = {
    patient_id: patientId,
    type,
    title,
    time: new Date().toISOString(),
  };
  if (description) event.description = description;
  if (oldValue !== undefined) event.old_value = oldValue;
  if (newValue !== undefined) event.new_value = newValue;
  if (performedByName) event.performed_by_name = performedByName;
  return event;
}

/**
 * Build a diff description for edit events.
 * Compares two objects and returns a human-readable diff string.
 * @param {object} before - Original values
 * @param {object} after - Updated values
 * @param {string[]} [fields] - Optional list of fields to compare
 * @returns {{ oldValue: string, newValue: string, description: string }}
 */
export function buildEditDiff(before, after, fields) {
  const keys = fields || Object.keys(after);
  const changes = [];
  for (const key of keys) {
    const oldVal = before[key];
    const newVal = after[key];
    if (oldVal !== newVal && newVal !== undefined) {
      changes.push(`${key}: ${oldVal || '—'} → ${newVal}`);
    }
  }
  if (changes.length === 0) return null;
  return {
    oldValue: changes.map((c) => c.split(' → ')[0]).join(', '),
    newValue: changes.map((c) => c.split(' → ')[1]).join(', '),
    description: changes.join('; '),
  };
}
