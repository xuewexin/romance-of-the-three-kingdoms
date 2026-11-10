import { MapNode, MapNodeType } from '../types.ts';
import { SeededRandom } from '../core/SeededRandom.ts';

export class DagMapGenerator {
  public static generate(act: number, rng: SeededRandom): MapNode[] {
    const totalFloors = 15;
    const numCols = 7;
    const nodes: Map<string, MapNode> = new Map();

    const getNodeId = (floor: number, col: number) => `f${floor}_c${col}`;

    // 1. Pick 3-4 starting columns on floor 0
    const startColCount = rng.range(3, 4);
    const startCols = rng.shuffle([1, 2, 3, 4, 5]).slice(0, startColCount).sort((a, b) => a - b);

    // Active paths by floor: set of active column indices at each floor
    const activeColsByFloor: number[][] = Array.from({ length: totalFloors }, () => []);
    activeColsByFloor[0] = [...startCols];

    // Connect upward from floor 0 to floor 13
    for (let floor = 0; floor < totalFloors - 2; floor++) {
      const currentCols = activeColsByFloor[floor];
      const nextFloor = floor + 1;
      const nextColSet = new Set<number>();

      // Track edges: [col1, col2]
      const edges: Array<[number, number]> = [];

      for (const col of currentCols) {
        // Can connect to col-1, col, col+1 (within 0..numCols-1)
        const candidates = [col - 1, col, col + 1].filter((c) => c >= 0 && c < numCols);
        // Pick 1 to 2 next columns
        const picks = rng.shuffle(candidates).slice(0, rng.range(1, 2));

        for (const pick of picks) {
          // Check anti-cross constraint:
          // If (col, pick) is (c, c+1), forbid any existing edge (c+1, c)
          let hasCross = false;
          for (const [prevC, prevNextC] of edges) {
            if (prevC === col + 1 && prevNextC === col) {
              hasCross = true;
              break;
            }
            if (prevC === col - 1 && prevNextC === col) {
              hasCross = true;
              break;
            }
          }

          if (!hasCross) {
            edges.push([col, pick]);
            nextColSet.add(pick);

            // Create/link nodes
            const fromId = getNodeId(floor, col);
            const toId = getNodeId(nextFloor, pick);

            if (!nodes.has(fromId)) {
              nodes.set(fromId, {
                id: fromId,
                floor,
                col,
                type: 'BATTLE',
                children: [],
                parents: []
              });
            }
            if (!nodes.has(toId)) {
              nodes.set(toId, {
                id: toId,
                floor: nextFloor,
                col: pick,
                type: 'BATTLE',
                children: [],
                parents: []
              });
            }

            const fromNode = nodes.get(fromId)!;
            const toNode = nodes.get(toId)!;

            if (!fromNode.children.includes(toId)) fromNode.children.push(toId);
            if (!toNode.parents.includes(fromId)) toNode.parents.push(fromId);
          }
        }
      }

      // 1. 确保本层所有节点至少拥有 1 个通往下一层的通路，杜绝死胡同
      for (const col of currentCols) {
        const fromId = getNodeId(floor, col);
        const fromNode = nodes.get(fromId);
        if (fromNode && fromNode.children.length === 0) {
          let targetCol = col;
          if (nextColSet.size > 0) {
            const arr = Array.from(nextColSet);
            arr.sort((a, b) => Math.abs(a - col) - Math.abs(b - col));
            targetCol = arr[0];
          } else {
            nextColSet.add(targetCol);
          }
          const toId = getNodeId(nextFloor, targetCol);
          if (!nodes.has(toId)) {
            nodes.set(toId, {
              id: toId,
              floor: nextFloor,
              col: targetCol,
              type: 'BATTLE',
              children: [],
              parents: []
            });
          }
          const toNode = nodes.get(toId)!;
          if (!fromNode.children.includes(toId)) fromNode.children.push(toId);
          if (!toNode.parents.includes(fromId)) toNode.parents.push(fromId);
          nextColSet.add(targetCol);
        }
      }

      // 2. 确保下一层绝对有活跃列
      if (nextColSet.size === 0) {
        const fallbackCol = currentCols[0] ?? 3;
        const toId = getNodeId(nextFloor, fallbackCol);
        nodes.set(toId, {
          id: toId,
          floor: nextFloor,
          col: fallbackCol,
          type: 'BATTLE',
          children: [],
          parents: []
        });
        nextColSet.add(fallbackCol);
        for (const col of currentCols) {
          const fromNode = nodes.get(getNodeId(floor, col));
          if (fromNode) {
            fromNode.children.push(toId);
            nodes.get(toId)!.parents.push(fromNode.id);
          }
        }
      }

      // Ensure every node on next floor has at least one parent
      activeColsByFloor[nextFloor] = Array.from(nextColSet).sort((a, b) => a - b);
    }

    // Floor 13 connects to single Boss node on floor 14 (col 3)
    const bossId = getNodeId(14, 3);
    const bossNode: MapNode = {
      id: bossId,
      floor: 14,
      col: 3,
      type: 'BOSS',
      children: [],
      parents: []
    };
    nodes.set(bossId, bossNode);

    for (const col of activeColsByFloor[13]) {
      const fromId = getNodeId(13, col);
      const fromNode = nodes.get(fromId);
      if (fromNode) {
        fromNode.children.push(bossId);
        bossNode.parents.push(fromId);
      }
    }

    // 2. Assign node types according to rules:
    // - Floor 0: Fixed BATTLE
    // - Floor 7: Fixed TREASURE
    // - Floor 13: Fixed REST (大军营帐)
    // - Floor 14: Fixed BOSS
    // - Before floor 5: NO ELITE, NO REST
    // - No consecutive REST, SHOP, ELITE
    for (const [id, node] of nodes.entries()) {
      if (node.floor === 0) {
        node.type = 'BATTLE';
      } else if (node.floor === 7) {
        node.type = 'TREASURE';
      } else if (node.floor === 13) {
        node.type = 'REST';
      } else if (node.floor === 14) {
        node.type = 'BOSS';
      } else {
        // Pool of available types based on floor
        let pool: MapNodeType[] = ['BATTLE', 'EVENT', 'SHOP'];
        if (node.floor >= 5) {
          pool.push('ELITE', 'REST');
        }

        // Check parents to prevent consecutive duplicates
        const parentTypes = node.parents.map((pId) => nodes.get(pId)?.type);
        const filteredPool = pool.filter((t) => {
          if (t === 'REST' && parentTypes.includes('REST')) return false;
          if (t === 'SHOP' && parentTypes.includes('SHOP')) return false;
          if (t === 'ELITE' && parentTypes.includes('ELITE')) return false;
          return true;
        });

        // Weights
        const weights: Record<MapNodeType, number> = {
          BATTLE: 45,
          EVENT: 25,
          SHOP: 12,
          ELITE: node.floor >= 5 ? 15 : 0,
          REST: node.floor >= 5 ? 12 : 0,
          TREASURE: 0,
          BOSS: 0
        };

        let totalW = 0;
        for (const t of filteredPool) totalW += weights[t];
        let roll = rng.next() * totalW;

        let chosen: MapNodeType = 'BATTLE';
        for (const t of filteredPool) {
          roll -= weights[t];
          if (roll <= 0) {
            chosen = t;
            break;
          }
        }
        node.type = chosen;
      }
    }

    // Mark floor 0 nodes as initially available
    for (const [id, node] of nodes.entries()) {
      if (node.floor === 0) {
        node.available = true;
      }
    }

    return Array.from(nodes.values());
  }
}
