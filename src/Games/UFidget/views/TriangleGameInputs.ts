import {
  TrianglesPlayerSettings,
  TrianglesTag,
  Difficulties,
  TrianglesSets,
  Difficulty,
} from '../models/TrianglesPlayerSettings';

export function TriangleGameInputs(options: {
  settings: TrianglesPlayerSettings;
  generateNewPattern: () => void;
  toggleInstructions: () => void;
  toggleDarkenLowerLayers: () => void;
  changeTrianglesTag: (tag: TrianglesTag) => void;
  changeDifficulty: (difficulty: Difficulty) => void;
}): (string | HTMLElement)[] {
  const { settings } = options;

  const triangleSetButtons = Object.keys(TrianglesSets).map((key) => {
    const set = TrianglesSets[key as TrianglesTag];
    return createRadioInput(set.displayName, settings.trianglesTag === set.tag, () => {
      if (settings.trianglesTag !== set.tag) {
        options.changeTrianglesTag(set.tag);
      }
    });
  });

  const difficultyButtons = Difficulties.map((d) =>
    createRadioInput(d, settings.difficulty === d, () => {
      if (settings.difficulty !== d) {
        options.changeDifficulty(d);
      }
    })
  );

  return [
    createBreak(),
    createButton('New Pattern', options.generateNewPattern),
    createButton('Toggle Instructions', options.toggleInstructions),
    createBreak(),
    createBreak(),
    ...triangleSetButtons,
    createBreak(),
    ...difficultyButtons,
    createBreak(),
    createCheckbox('Hint: Darken Lower Layers', settings.darkenLowerLayers, options.toggleDarkenLowerLayers),
  ];
}

function createDivider() {
  const br = document.createElement('div');
  br.style.flexBasis = '100%';
  br.style.height = '2px';
  br.style.backgroundColor = 'lightGray';
  return br;
}

function createBreak() {
  const br = document.createElement('div');
  br.style.flexBasis = '100%';
  br.style.height = '4px';
  return br;
}

function createButton(text: string, fn: (setText: (text: string) => void) => void) {
  let button = document.createElement('button');
  button.innerText = text;
  button.style.padding = '8px';

  const setText = (text: string) => (button.innerText = text);
  button.onclick = () => fn(setText);

  return button;
}

function createCheckbox(text: string, checked: boolean, fn: (setChecked: (checked: boolean) => void) => void) {
  return createInput(text, checked, 'checkbox', fn);
}

function createRadioInput(text: string, checked: boolean, fn: (setChecked: (checked: boolean) => void) => void) {
  return createInput(text, checked, 'radio', fn);
}

function createInput(
  text: string,
  checked: boolean,
  type: 'checkbox' | 'radio',
  fn: (setChecked: (checked: boolean) => void) => void
) {
  let checkbox = document.createElement('input');
  checkbox.type = type;
  checkbox.checked = checked;

  const label = document.createElement('div');
  label.innerText = text;

  const container = document.createElement('div');
  container.appendChild(checkbox);
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.columnGap = '2px';
  container.style.alignItems = 'start';
  container.style.padding = '2px';
  container.appendChild(label);

  const setChecked = (checked: boolean) => (checkbox.checked = checked);
  container.onclick = () => fn(setChecked);

  return container;
}

function createSliderContainer() {
  let container = document.createElement('div');
  container.style.display = 'grid';
  container.style.gridTemplateColumns = 'repeat(auto-fit, minmax(min(100%/2, max(280px, 100%/3)), 1fr))';
  container.style.columnGap = 'inherit';
  container.style.rowGap = 'inherit';
  container.style.width = '100%';
  return container;
}
