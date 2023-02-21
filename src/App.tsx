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

      {alarms.map(({ timeSet }, index) => {
        const hoursLabel = timeSet.getHours().toString().padStart(2, '0');
        const minutesLabel = timeSet.getMinutes().toString().padStart(2, '0');

        const key = `alarm-${timeSet.toString()}-#${index}`;

        return <div key={key}>{`${hoursLabel}:${minutesLabel}`}</div>;
      })}
    </div>
  );
}

export default App;
