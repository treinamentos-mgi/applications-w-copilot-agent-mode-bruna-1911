import { useEffect, useState, type ReactNode } from 'react';

type State<T> =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'success'; items: T[] };

type Props<T> = {
  title: string;
  description: string;
  loadItems: () => Promise<T[]>;
  emptyText: string;
  renderItem: (item: T) => ReactNode;
};

export function CapabilityCard<T>({ title, description, loadItems, emptyText, renderItem }: Props<T>) {
  const [state, setState] = useState<State<T>>({ status: 'loading' });

  useEffect(() => {
    let active = true;
    setState({ status: 'loading' });
    loadItems()
      .then((items) => {
        if (!Array.isArray(items)) throw new Error('Resposta da API inválida');
        if (active) setState({ status: 'success', items });
      })
      .catch(() => {
        if (active) setState({ status: 'error' });
      });
    return () => { active = false; };
  }, [loadItems]);

  return <section className="card h-100"><div className="card-body">
    <h2 className="h4">{title}</h2>
    <p>{description}</p>
    {state.status === 'loading' && <p role="status">Carregando...</p>}
    {state.status === 'error' && <p role="alert">Não foi possível carregar os dados. Tente novamente mais tarde.</p>}
    {state.status === 'success' && (state.items.length === 0
      ? <p>{emptyText}</p>
      : <ul>{state.items.map((item, index) => <li key={index}>{renderItem(item)}</li>)}</ul>)}
  </div></section>;
}
