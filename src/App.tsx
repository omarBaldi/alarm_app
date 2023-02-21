import { useEffect, useMemo, useRef, useState } from 'react';
import { getNumberSeconds } from './utils/get-number-seconds';
import alarmSound from './assets/audio/alarm.mp3';
import './App.css';

interface Alarm {
  timeSet: Date;
  isActive: boolean;
}

const defaultInitialTimeValue = '00:00';

function App() {
  const [alarms, setAlarms] = useState<Map<string, { isActive: boolean }>>(new Map());
  const inputTimeReference = useRef<HTMLInputElement>(null);

  //* Audio state
  const isAudioPlaying = useRef<boolean>(false);
  const audioContext = useRef<AudioContext | null>(null);
  const audioBuffer = useRef<AudioBuffer | null>(null);
  const sourceNode = useRef<AudioBufferSourceNode | null>(null);

  /**
   * As soon as the component gets mounted,
   * create an audio file
   */
  useEffect(() => {
    //* create an AudioContext when the component mounts
    const context = new AudioContext();
    audioContext.current = context;

    //* load the audio file into an AudioBuffer
    fetch(alarmSound)
      .then((response) => response.arrayBuffer())
      .then((arrayBuffer) => context.decodeAudioData(arrayBuffer))
      .then((buffer) => (audioBuffer.current = buffer))
      .catch((err) => console.error(err));

    //* clean up the AudioContext when the component unmounts
    return () => {
      context.close();
    };
  }, []);

  useEffect(() => {
    const checkFirstAlarmState = (alarm: Alarm) => {
      const diffInSeconds = getNumberSeconds({
        startDate: new Date(),
        endDate: alarm.timeSet,
      });

      if (diffInSeconds < 0) return;

      /**
       * If the amount of seconds is between 0 and 60 included
       * that means based on the current time (now) I am in the range
       * of the alarm time set. This means that depending on the active
       * state, I can either play the audio or stop it.
       */
      if (diffInSeconds <= 60) {
        alarm.isActive ? playAudio() : stopAudio();
      } else {
        //TODO: increment index to go to next alarm
        //* temporarily invoke function to stop audio
        stopAudio();
      }
    };

    if (alarms.size <= 0) return;

    /**
     * I know at this point that there is at least
     * one alarm that has been set, so get the values.
     */
    const startIndex = 0;
    const [key, value] = [...alarms][startIndex];

    const firstAlarmObj: Alarm = {
      timeSet: new Date(key),
      isActive: value.isActive,
    };

    const interval = setInterval(() => checkFirstAlarmState(firstAlarmObj), 1000);

    return () => {
      clearInterval(interval);
    };
  }, [alarms]);

  function handleCreateNewAlarm(e: React.FormEvent): void {
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
  }

  function handleAlarmStateChange(e: React.ChangeEvent<HTMLInputElement>): void {
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
  }

  function playAudio(): void {
    if (!audioContext.current || !audioBuffer.current || isAudioPlaying.current) return;

    if (audioContext.current.state === 'suspended') {
      audioContext.current.resume();
    }

    sourceNode.current = audioContext.current.createBufferSource();
    sourceNode.current.buffer = audioBuffer.current;
    sourceNode.current.connect(audioContext.current.destination);

    sourceNode.current.loop = true;
    sourceNode.current.start(0);

    isAudioPlaying.current = true;
  }

  function stopAudio(): void {
    if (!sourceNode.current || !isAudioPlaying.current) return;

    sourceNode.current.stop();
    sourceNode.current.disconnect();

    sourceNode.current = null;
    isAudioPlaying.current = false;

    audioContext.current?.suspend();
  }

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
