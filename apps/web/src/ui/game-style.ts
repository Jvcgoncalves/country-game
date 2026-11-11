export class GameStyle {
  static roundButton(selected: boolean): string {
    return `preset-button${selected ? ' is-selected' : ''}`;
  }

  static languageButton(selected: boolean): string {
    return `language-option${selected ? ' is-selected' : ''}`;
  }

  static textField(): string {
    return 'answer-field';
  }
}
