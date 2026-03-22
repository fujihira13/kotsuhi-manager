/**
 * 全データ削除コマンド
 * 対象: 支出・テンプレート・前回入力値
 * ドメインイベント: AllDataCleared を発行する
 */
export interface ClearAllDataCommand {
  // 引数なし：全データを対象とする
}
