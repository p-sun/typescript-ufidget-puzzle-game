import { Difficulties, TrianglesGameSettings, TrianglesSets, TrianglesTag } from '../TrianglesGame';

export function TriangleGameInputs(options: {
  settings: TrianglesGameSettings;
  generateNewPattern: () => void;
  toggleInstructions: () => void;
  onChange: (settings: TrianglesGameSettings) => void;
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
      createRadioInput(set.displayName, settings.trianglesTag === set.tag, () => {
        if (settings.trianglesTag !== set.tag) {
          onChange({ ...settings, trianglesTag: set.tag as TrianglesTag });
        }
      })
    );
  }

  inputs.push(createBreak());
  for (const d of Difficulties) {
    inputs.push(
      createRadioInput(d, settings.difficulty === d, () => {
        if (settings.difficulty !== d) {
          onChange({ ...settings, difficulty: d });
        }
      })
    );
  }

  inputs.push(createBreak());
  inputs.push(
    createCheckbox('Hint: Darken Lower Layers', settings.darkenLowerLayers, () =>
      onChange({ ...settings, darkenLowerLayers: !settings.darkenLowerLayers })
    )
  );

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
