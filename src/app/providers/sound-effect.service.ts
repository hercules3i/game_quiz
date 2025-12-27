import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SoundEffectService {
  select = new Howl({ src: 'https://admin.metalearn.vn/app/song/select_Sound.mp3' });
  match = new Howl({ src: 'https://admin.metalearn.vn/app/song/match_Sound.mp3' });
  multi = new Howl({ src: 'https://admin.metalearn.vn/app/song/multi_Sound.mp3' });
  input = new Howl({ src: 'https://admin.metalearn.vn/app/song/input_Sound.mp3' });
  correct = new Howl({ src: 'https://admin.metalearn.vn/app/song/correct.mp3' });
  incorrect = new Howl({ src: 'https://admin.metalearn.vn/app/song/incorrect.mp3' });
  hint = new Howl({ src: '/assets/sounds/Hint.mp3' });
  wrong = new Howl({ src: '/assets/sounds/Wrong.mp3' });
  congratulations = new Howl({ src: '/assets/sounds/Right.mp3' });

  constructor() { }
}
