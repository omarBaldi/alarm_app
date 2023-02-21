import { useRef, useState } from 'react';
import './App.css';

interface Alarm {
  timeSet: Date;
  isActive: boolean;
}

const defaultInitialTimeValue = '00:00';

function App() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const inputTimeReference = useRef<HTMLInputElement>(null);

  const handleCreateNewAlarm = (e: React.FormEvent): void => {
    e.preventDefault();

    /**
     * In order to prevent the application from
     * being re-rendered whenever the input value changes,
     * using a reference to access the value is optimal in this case.
     */

    if (!inputTimeReference.current) return;

    const { value: updatedAlarmValue } = inputTimeReference.current;
    const [hours, minutes] = updatedAlarmValue.split(':');

    const alarmTime = new Date();
    alarmTime.setHours(+hours);
    alarmTime.setMinutes(+minutes);

    const newAlarm: Alarm = {
      isActive: true,
      timeSet: alarmTime,
    };

    setAlarms((prevAlarms) => [...prevAlarms, newAlarm]);

    //* reset input value
    inputTimeReference.current.value = defaultInitialTimeValue;
  };

  const handleAlarmStateChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { checked: updatedAlarmActiveState, dataset } = e.target;
    const alarmIndex: string | undefined = dataset['index'];

    if (typeof alarmIndex === 'undefined' || isNaN(+alarmIndex)) return;

    setAlarms((prevAlarms) => {
      return [...prevAlarms].map((alarm, i) =>
        i === +alarmIndex ? { ...alarm, isActive: updatedAlarmActiveState } : alarm
      );
    });
  };

  return (
    <div className='App'>
      <form
        onSubmit={handleCreateNewAlarm}
        style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
      >
        <input
          type='time'
          name='alarmInput'
          ref={inputTimeReference}
          defaultValue={defaultInitialTimeValue}
        />
        <button type='submit'>Add alarm</button>
      </form>

      {alarms.map(({ timeSet, isActive }, index) => {
        const hoursLabel = timeSet.getHours().toString().padStart(2, '0');
        const minutesLabel = timeSet.getMinutes().toString().padStart(2, '0');

        const key = `alarm-${timeSet.toString()}-#${index}`;

        return (
          <div
            key={key}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <h4>{`${hoursLabel}:${minutesLabel}`}</h4>
            <input
              type='checkbox'
              name='alarmActiveState'
              checked={isActive}
              data-index={index}
              onChange={handleAlarmStateChange}
            />
          </div>
        );
      })}
    </div>
  );
}

export default App;
