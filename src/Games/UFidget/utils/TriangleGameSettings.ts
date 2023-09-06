import { TrianglesTag, TrianglesSets } from '../TrianglesGame';

export type TrianglesGameSettings = {
  trianglesTag: TrianglesTag;
};

export function TriangleGameInputs(options: {
  settings: TrianglesGameSettings;
  generateNewPattern: () => void;
  toggleInstructions: () => void;
  onChange: () => void;
}): (string | HTMLElement)[] {
  const { settings, onChange, generateNewPattern, toggleInstructions } = options;

  let inputs: (string | HTMLElement)[] = [
    createBreak(),
    createButton('New Pattern', () => {
      generateNewPattern();
    }),
    createButton('Toggle Instructions', () => {
      toggleInstructions();
    }),
    createBreak(),
  ];

  for (const key of Object.keys(TrianglesSets)) {
    const set = TrianglesSets[key as TrianglesTag];
    inputs.push(
      createRadioInput(set.displayName, settings.trianglesTag === set.tag, (setChecked) => {
        settings.trianglesTag = set.tag as TrianglesTag;
        setChecked(true);
        onChange();
      })
    );
  }

  return inputs;
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

  const setChecked = (checked: boolean) => (checkbox.checked = checked);
  checkbox.onclick = () => fn(setChecked);

  const label = document.createElement('div');
  label.innerText = text;

  const container = document.createElement('div');
  container.appendChild(checkbox);
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.columnGap = '2px';
  container.style.alignItems = 'start';

  container.appendChild(label);

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
