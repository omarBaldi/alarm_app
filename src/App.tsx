import { useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { getNumberSeconds } from './utils/get-number-seconds';

interface Alarm {
  timeSet: Date;
  isActive: boolean;
}

const defaultInitialTimeValue = '00:00';

function App() {
  const [alarms, setAlarms] = useState<Map<string, { isActive: boolean }>>(new Map());
  const inputTimeReference = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkFirstAlarmState = (alarm: Alarm) => {
      const diffInSeconds = getNumberSeconds({
        startDate: new Date(),
        endDate: alarm.timeSet,
      });

      /**
       * If the amount of seconds is between 0 and 60 included
       * that means based on the current time (now) I am in the range
       * of the alarm time set. This means that depending on the active
       * state, I can either play the audio or stop it.
       */
      const isInRange = diffInSeconds >= 0 && diffInSeconds <= 60;

      if (isInRange) {
        /**
         * TODO: logic to be written
         */
      }
    };

    if (alarms.size <= 0) return;

    /**
     * I know at this point that there is at least
     * one alarm that has been set, so get the values.
     */
    const [[key, value]] = [...alarms];

    const firstAlarmObj: Alarm = {
      timeSet: new Date(key),
      isActive: value.isActive,
    };

    const interval = setInterval(() => checkFirstAlarmState(firstAlarmObj), 1000);

    return () => {
      clearInterval(interval);
    };
  }, [alarms]);

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

      return typeof prevCurrentAlarmClickedValues === 'undefined'
        ? prevAlarms
        : updatedAlarms.set(alarmTimeKey, {
            ...prevCurrentAlarmClickedValues,
            isActive: updatedAlarmActiveState,
          });
    });
  };

  const sortedAlarms = useMemo(() => {
    return [...alarms]
      .reduce<{ alarmLabel: string; isActive: boolean; timeSet: string }[]>(
        (acc, [timeSet, { isActive }]) => {
          const hoursLabel = new Date(timeSet).getHours().toString().padStart(2, '0');
          const minutesLabel = new Date(timeSet).getMinutes().toString().padStart(2, '0');

          return [
            ...acc,
            {
              alarmLabel: `${hoursLabel}:${minutesLabel}`,
              isActive,
              timeSet,
            },
          ];
        },
        []
      )
      .sort((a, b) => a.timeSet.localeCompare(b.timeSet));
  }, [alarms]);

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

      {sortedAlarms.map(({ alarmLabel, isActive, timeSet }, index) => {
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
            <h4>{alarmLabel}</h4>
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
