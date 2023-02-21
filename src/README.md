# Alarm application

### Description

The user will be prompted with a HTML input element defined with type "time" where he's given the choice to set the hours as well as the minutes.
Once chosen the time, on button "Add alarm" click, a new alarm will be created and pushed into the array state.
Once created, it will be rendered in the DOM with the time set and a input checkbox that will either set the alarm to active/not-active.

The application will have a "setInterval" to constantly check the first alarm in the stack.
As soon as I am in the range of the alarm time set, I have 2 different cases to take into consideration:

- if the alarm is set to active (default) and no audio is playing ---> start playing audio
- if the alarm is not active anymore but the audio is playing (from before) ---> stop the audio

While checking every n milliseconds (where n corresponds to an integer number) if the current time (now) is greater than the first alarm set, then it should increment the index to keep track of the current alarm.
