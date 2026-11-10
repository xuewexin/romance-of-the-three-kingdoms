import { EnemyIntent } from '../types.ts';
import { GameIcons } from './GameIcons.ts';

export class IntentIndicator {
  public static render(intent: EnemyIntent): string {
    let label = '';
    let colorClass = 'intent-attack';

    switch (intent.type) {
      case 'ATTACK':
        label = `${intent.damage ?? '?'}`;
        colorClass = 'intent-attack';
        break;
      case 'MULTI_ATTACK':
        label = `${intent.damage ?? '?'} × ${intent.hits ?? 1}`;
        colorClass = 'intent-attack';
        break;
      case 'DEFEND':
        label = `${intent.block ?? '?'}`;
        colorClass = 'intent-defend';
        break;
      case 'BUFF':
        label = '蓄势';
        colorClass = 'intent-buff';
        break;
      case 'DEBUFF':
        label = '诅咒';
        colorClass = 'intent-debuff';
        break;
      case 'ATTACK_DEBUFF':
        label = `${intent.damage ?? '?'}`;
        colorClass = 'intent-attack-debuff';
        break;
      case 'CHARGE':
        label = '引雷蓄力';
        colorClass = 'intent-charge';
        break;
      default:
        label = '未知';
        colorClass = 'intent-unknown';
        break;
    }

    const iconSvg = GameIcons.getIntentIconSvg(intent.type);

    return `
      <div class="enemy-intent ${colorClass}" title="${intent.description || ''}">
        <span class="intent-icon">${iconSvg}</span>
        ${label ? `<span class="intent-label">${label}</span>` : ''}
      </div>
    `;
  }
}
