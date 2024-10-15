// atoms/summaryAtom.js
import { atom } from 'recoil';

export const summaryState = atom({
  key: 'summaryState', // unique ID (with respect to other atoms/selectors)
  default: { summarized_text: "", translated_text: "" }, // default value (aka initial value)
});
