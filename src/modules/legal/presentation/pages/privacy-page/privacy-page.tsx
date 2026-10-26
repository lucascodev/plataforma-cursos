import { makeSiteConfig } from '@/shared/main/factories/make-site-config.factory';
import { ExternalLink } from '@/shared/presentation/components/navigation/external-link/external-link';
import { PRIVACY_COOKIES } from '../../constants/privacy-cookies';
import { PRIVACY_PROMISES } from '../../constants/privacy-promises';
import { PRIVACY_SECTIONS } from '../../constants/privacy-sections';
import styles from './privacy-page.module.css';


export function PrivacyPage() {
  const site = makeSiteConfig();

  return (
    <div className={styles.layout}>
      <nav className={styles.toc} aria-label="Nesta página">
        <p className={styles.tocTitle}>Nesta página</p>
        {PRIVACY_SECTIONS.map((section) => (
          <a key={section.id} href={`#${section.id}`}>
            {section.title}
          </a>
        ))}
      </nav>
      <article className={styles.page}>
        <title>{`Privacidade · ${site.name}`}</title>
        <header className={styles.header}>
          <h1 className={styles.title}>Privacidade</h1>
          <p className={styles.lead}>
            Este texto explica, em linguagem direta, quais dados a plataforma guarda, onde ficam e como apagar. Ele segue a LGPD (Lei 13.709/2018).
          </p>
        </header>
        <ul className={styles.promises}>
          {PRIVACY_PROMISES.map((promise) => (
            <li key={promise.title}>
              <span className={styles.promiseTitle}>{promise.title}</span>
              <span>{promise.text}</span>
            </li>
          ))}
        </ul>

        <section id="o-que-fica-guardado" className={styles.section} aria-labelledby="o-que-fica-guardado-titulo">
          <h2 id="o-que-fica-guardado-titulo">O que fica guardado</h2>
          <p>Para estudar é preciso entrar com o GitHub. A plataforma usa o Supabase para autenticação e banco de dados. Ficam guardados:</p>
          <ul>
            <li>o identificador da sua conta, o nome público e a foto do perfil do GitHub;</li>
            <li>o e-mail principal da conta GitHub, que o serviço de autenticação registra no login (a plataforma não exibe nem usa esse e-mail);</li>
            <li>seu perfil: endereço (o login do GitHub), nome, texto sobre você, links e papel (estudante, professor ou admin);</li>
            <li>suas preferências de conta: tema, fuso horário e quais avisos você quer receber;</li>
            <li>por curso: itens concluídos, dias feitos, data de início, anotações dos módulos, o diário, os requisitos marcados nos projetos e a entrega de cada projeto (link do repositório, link da demonstração e os números que você escrever);</li>
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

        <section id="cookies" className={styles.section} aria-labelledby="cookies-titulo">
          <h2 id="cookies-titulo">Cookies</h2>
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
              {PRIVACY_COOKIES.map((cookie) => (
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

        <section id="direitos" className={styles.section} aria-labelledby="direitos-titulo">
          <h2 id="direitos-titulo">Seus direitos</h2>
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

        <section id="responsavel" className={styles.section} aria-labelledby="responsavel-titulo">
          <h2 id="responsavel-titulo">Quem é responsável</h2>
          <p>
            Cada instância publicada é responsabilidade de quem a publicou. O código é aberto e pode ser conferido em{' '}
            <ExternalLink href={site.repositoryUrl}>{site.repositoryUrl.replace('https://', '')}</ExternalLink>.
          </p>
        </section>
      </article>
    </div>
  );
}
