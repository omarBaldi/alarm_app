import { useRef, useState } from 'react';
import './App.css';

interface Alarm {
  timeSet: Date;
  isActive: boolean;
}

const defaultInitialTimeValue = '00:00';

function App() {
  const [alarms, setAlarms] = useState<Map<string, { isActive: boolean }>>(new Map());
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
    alarmTime.setSeconds(0);

    setAlarms((prevAlarms) => {
      const updatedAlarms = new Map(prevAlarms);

      return updatedAlarms.has(alarmTime.toString())
        ? prevAlarms
        : updatedAlarms.set(alarmTime.toString(), { isActive: true });
    });

    //* reset input value
    inputTimeReference.current.value = defaultInitialTimeValue;
  };

  const handleAlarmStateChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { checked: updatedAlarmActiveState, dataset } = e.target;
    const alarmTimeKey: string | undefined = dataset['timeSet'];

    if (typeof alarmTimeKey === 'undefined') return;

    setAlarms((prevAlarms) => {
      const updatedAlarms = new Map(prevAlarms);
      const prevCurrentAlarmClickedValues = updatedAlarms.get(alarmTimeKey);
      console.log(prevCurrentAlarmClickedValues);

      return typeof prevCurrentAlarmClickedValues === 'undefined'
        ? prevAlarms
        : updatedAlarms.set(alarmTimeKey, {
            ...prevCurrentAlarmClickedValues,
            isActive: updatedAlarmActiveState,
          });
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

      {[...alarms].map(([timeSet, { isActive }], index) => {
        const hoursLabel = new Date(timeSet).getHours().toString().padStart(2, '0');
        const minutesLabel = new Date(timeSet).getMinutes().toString().padStart(2, '0');

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
              data-time-set={timeSet}
              onChange={handleAlarmStateChange}
            />
          </div>
        );
      })}
    </div>
  );
}

export default App;
