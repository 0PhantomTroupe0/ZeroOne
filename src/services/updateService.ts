/**
 * MODULO DE ATUALIZAÇÃO AUTOMÁTICA (Cyber-Ritualist Update System)
 * 
 * Este serviço monitora o repositório remoto em busca de novas versões
 * e gerencia o ciclo de vida da atualização.
 */

export interface UpdateInfo {
  version: string;
  changelog: string;
  forceUpdate: boolean;
  publishedAt: string;
}

class UpdateService {
  private currentVersion: string = "0.1.0"; // Versão fixa local ou vinda do package.json
  private remoteUrl: string = "https://raw.githubusercontent.com/0PhantomTroupe0/ZeroOne/main/version.json";
  private checkInterval: number = 1000 * 60 * 30; // 30 minutos
  private autoUpdateEnabled: boolean = true;

  /**
   * Inicializa o serviço e verifica a versão local do package.json
   */
  constructor() {
    // Em produção Next.js, podemos injetar a versão via env var ou import direto
    // Para simplificar, assumimos o ponto de partida do package.json
  }

  /**
   * Busca os dados da versão remota com Cache Busting
   */
  async checkRemoteVersion(): Promise<UpdateInfo | null> {
    try {
      // Cache busting adicionando timestamp
      const response = await fetch(`${this.remoteUrl}?t=${Date.now()}`, {
        cache: 'no-store'
      });

      if (!response.ok) throw new Error("Falha ao consultar GitHub");

      const data = await response.json();
      return data as UpdateInfo;
    } catch (error) {
      console.warn("[UpdateService] Fallback: GitHub inacessível ou arquivo ausente.", error);
      return null;
    }
  }

  /**
   * Compara strings de versão (ex: 0.1.0 vs 0.1.1)
   */
  isNewer(remoteVersion: string): boolean {
    const local = this.currentVersion.split('.').map(Number);
    const remote = remoteVersion.split('.').map(Number);

    for (let i = 0; i < 3; i++) {
        if (remote[i] > local[i]) return true;
        if (remote[i] < local[i]) return false;
    }
    return false;
  }

  /**
   * Executa o processo de atualização (Recarregamento forçado)
   */
  applyUpdate() {
    console.log("[UpdateService] Iniciando recarregamento de sistema...");
    
    // Evita loop infinito: se já tentou atualizar nesta sessão e a versão não mudou, para.
    const lastUpdateAttempt = sessionStorage.getItem('last_update_attempt');
    if (lastUpdateAttempt === this.currentVersion) {
        console.warn("[UpdateService] Loop detectado. Interrompendo atualização automática.");
        return;
    }

    sessionStorage.setItem('last_update_attempt', this.currentVersion);
    
    // Força recarregamento limpando cache do navegador se possível
    window.location.reload();
  }

  /**
   * Configuração dinâmica
   */
  setConfig(auto: boolean) {
    this.autoUpdateEnabled = auto;
  }

  isAutoEnabled() {
    return this.autoUpdateEnabled;
  }
}

export const updateService = new UpdateService();
