import { makeSiteConfig } from '@/shared/main/factories/make-site-config.factory';
import { ExternalLink } from '@/shared/presentation/components/navigation/external-link/external-link';
import styles from './privacy-page.module.css';

const COOKIES = [
  { name: '__Host-ca-access', purpose: 'Mantém você conectado enquanto usa o site.', duration: 'Cerca de 1 hora' },
  { name: '__Host-ca-refresh', purpose: 'Renova a sessão sem pedir login de novo.', duration: '30 dias' },
  { name: '__Host-ca-verifier', purpose: 'Protege a volta do GitHub durante o login.', duration: '10 minutos' },
  { name: '__Host-ca-return', purpose: 'Lembra a página para onde voltar depois do login.', duration: '10 minutos' },
] as const;

export function PrivacyPage() {
  const site = makeSiteConfig();

  return (
    <article className={styles.page}>
      <title>{`Privacidade · ${site.name}`}</title>
      <h1 className={styles.title}>Privacidade</h1>
      <p className={styles.lead}>
        Este texto explica, em linguagem direta, quais dados a plataforma guarda, onde ficam e como apagar. Ele segue a LGPD (Lei 13.709/2018).
      </p>

      <section className={styles.section}>
        <h2>O que fica guardado</h2>
        <p>Para estudar é preciso entrar com o GitHub. A plataforma usa o Supabase para autenticação e banco de dados. Ficam guardados:</p>
        <ul>
          <li>o identificador da sua conta, o nome público e a foto do perfil do GitHub;</li>
          <li>o e-mail principal da conta GitHub, que o serviço de autenticação registra no login (a plataforma não exibe nem usa esse e-mail);</li>
          <li>seu perfil: endereço (o login do GitHub), nome, texto sobre você, links e papel (estudante, professor ou admin);</li>
          <li>suas preferências de conta: tema, fuso horário e quais avisos você quer receber;</li>
          <li>por curso: itens concluídos, dias feitos, data de início, anotações dos módulos e o diário;</li>
          <li>as propostas de curso que você enviar e a resposta da equipe;</li>
          <li>um histórico das ações de administração (aprovações, trocas de papel, mudanças em cursos), com quem fez e quando.</li>
        </ul>
        <p>
          O perfil de estudante é privado. Só o perfil de quem dá aula fica público, com nome, foto, texto, links e cursos publicados. A
          contagem de pessoas estudando só aparece se o professor escolher mostrar.
        </p>
        <p>
          Anotações, diário e progresso individual são só seus. Nem professores nem admins conseguem ler: eles veem apenas números somados,
          como quantas pessoas estudam um curso.
        </p>
        <p>
          Não pedimos acesso aos seus repositórios. Não há anúncios, rastreamento nem ferramentas de análise de uso. Os dados servem só para mostrar
          seu progresso em qualquer aparelho.
        </p>
      </section>

      <section className={styles.section}>
        <h2>Cookies</h2>
        <p>
          O site usa apenas cookies essenciais, do próprio site, para manter sua sessão. Eles são marcados como HttpOnly e Secure: o JavaScript da
          página não consegue lê-los e eles só trafegam por HTTPS. Não há cookies de terceiros. Por serem necessários para o login funcionar, não
          pedimos consentimento separado para eles.
        </p>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Nome</th>
              <th scope="col">Para que serve</th>
              <th scope="col">Duração</th>
            </tr>
          </thead>
          <tbody>
            {COOKIES.map((cookie) => (
              <tr key={cookie.name}>
                <td>
                  <code>{cookie.name}</code>
                </td>
                <td>{cookie.purpose}</td>
                <td>{cookie.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>Nada fica no armazenamento local do navegador. Sair da conta apaga os cookies de sessão.</p>
      </section>

      <section className={styles.section}>
        <h2>Seus direitos</h2>
        <ul>
          <li>
            <strong>Corrigir seus dados:</strong> nome, texto e links ficam em <em>Meu perfil</em>; tema e avisos, em <em>Conta</em>.
          </li>
          <li>
            <strong>Ver e levar seus dados:</strong> na página de cada curso, use <em>Exportar backup</em> (arquivo JSON) ou <em>Exportar diário</em>.
          </li>
          <li>
            <strong>Apagar:</strong> na página de cada curso, use <em>Apagar meu progresso</em>. A exclusão é imediata e definitiva.
          </li>
          <li>
            <strong>Revogar o acesso do GitHub:</strong> em GitHub, abra Settings, depois Applications, depois Authorized OAuth Apps, e remova o
            aplicativo.
          </li>
          <li>
            <strong>Excluir a conta de login:</strong> peça a quem mantém esta instância, abrindo uma solicitação no repositório. Perfil,
            preferências, propostas e progresso são apagados junto com a conta. No histórico de administração, o nome some e fica só o registro
            da ação.
          </li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2>Quem é responsável</h2>
        <p>
          Cada instância publicada é responsabilidade de quem a publicou. O código é aberto e pode ser conferido em{' '}
          <ExternalLink href={site.repositoryUrl}>{site.repositoryUrl.replace('https://', '')}</ExternalLink>.
        </p>
      </section>
    </article>
  );
}
