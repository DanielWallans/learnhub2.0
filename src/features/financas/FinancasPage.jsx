import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowDownRight, ArrowUpRight, Wallet, Plus, Minus, PiggyBank, Pencil, CreditCard, RotateCcw, Send, Zap } from 'lucide-react';
import { collection, query, where, onSnapshot, doc, addDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { useStudent } from '@/context/StudentContext';
import { ModuleFrame } from '@/components/layout/ModuleFrame';
import { Button } from '@/components/ui/button';
import { Field, Input, Select, TextField } from '@/components/ui/field';
import { Dialog } from '@/components/ui/dialog';
import { EmptyState, Section, Segmented } from '@/components/ui/primitives';
import { useFeedback } from '@/components/ui/feedback';
import { QuickDelete } from '@/components/ui/quick-delete';
import FinancasImg from '@/assets/modules/financas.jpg';
import { COL } from '@/lib/collections';
import { RESUMO_INICIAL, CARD_STYLES, cardStyle, MESES, brl, getTxIcon } from '@/features/financas/lib/constants';
import { AnimatedMoney } from '@/features/financas/components/AnimatedMoney';
import { processarLancamento } from '@/features/financas/lib/lancamento';
import { CashflowChart } from '@/features/financas/components/CashflowChart';

export default function ModuloFinancas() {
  const { user } = useStudent();
  const { toast, confirm } = useFeedback();

  const [resumo, setResumo] = useState(RESUMO_INICIAL);
  const [transacoes, setTransacoes] = useState([]);
  const [filtroTx, setFiltroTx] = useState('todas');

  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [txModalType, setTxModalType] = useState(null); // 'saque' | 'deposito' | null

  const [tempBalance, setTempBalance] = useState('');
  const [tempSaved, setTempSaved] = useState('');
  const [tempCard, setTempCard] = useState(RESUMO_INICIAL);
  const [tempTxValue, setTempTxValue] = useState('');
  const [tempTxDesc, setTempTxDesc] = useState('');

  const [inputText, setInputText] = useState('');
  const [mensagens, setMensagens] = useState([]);

  const { totalBalance, totalSpending, totalSaved, cardBalance } = resumo;

  // Resumo e transações em tempo real
  useEffect(() => {
    if (!user) return undefined;

    const summaryRef = doc(db, COL.financasResumo, user.uid);
    const unsubSummary = onSnapshot(summaryRef, (snapshot) => {
      if (snapshot.exists()) {
        setResumo({ ...RESUMO_INICIAL, ...snapshot.data() });
      } else {
        setDoc(summaryRef, RESUMO_INICIAL);
        setResumo(RESUMO_INICIAL);
      }
    }, (err) => console.error('Erro no resumo financeiro:', err));

    const txQuery = query(collection(db, COL.financasTransacoes), where('userId', '==', user.uid));
    const unsubTx = onSnapshot(txQuery, (snapshot) => {
      const txData = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      txData.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
      setTransacoes(txData);
    }, (err) => console.error('Erro nas transações:', err));

    return () => {
      unsubSummary();
      unsubTx();
    };
  }, [user]);

  const salvarResumo = (dados) => setDoc(doc(db, COL.financasResumo, user.uid), dados, { merge: true });

  const registrarTransacao = async ({ nome, valor, categoria, icone }) => {
    await addDoc(collection(db, COL.financasTransacoes), {
      nome,
      valor,
      data: new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' }),
      categoria,
      icone,
      createdAt: Date.now(),
      userId: user.uid
    });
  };

  const handleUpdateFinanceData = async ({ type, value, desc, category, icon }) => {
    let newBalance = totalBalance;
    let newSpending = totalSpending;
    let newSaved = totalSaved;

    if (type === 'save') {
      newBalance = Math.max(0, totalBalance - value);
      newSaved = totalSaved + value;
    } else if (type === 'expense') {
      newSpending = totalSpending + value;
      newBalance = totalBalance - value;
    } else if (type === 'income') {
      newBalance = totalBalance + value;
    }

    try {
      await registrarTransacao({ nome: desc, valor: type === 'income' ? value : -value, categoria: category, icone: icon });
      await salvarResumo({ totalBalance: newBalance, totalSpending: newSpending, totalSaved: newSaved });
    } catch (err) {
      console.error('Erro ao salvar lançamento:', err);
      toast({ title: 'Não foi possível salvar o lançamento', tone: 'error' });
    }
  };

  const handleSaveBalance = async (e) => {
    e.preventDefault();
    try {
      await salvarResumo({ totalBalance: parseFloat(tempBalance) || 0, totalSaved: parseFloat(tempSaved) || 0 });
      setShowBalanceModal(false);
      toast({ title: 'Saldos atualizados', tone: 'success' });
    } catch (err) {
      toast({ title: 'Não foi possível salvar', tone: 'error' });
    }
  };

  const handleSaveCard = async (e) => {
    e.preventDefault();
    try {
      await salvarResumo({
        cardBrand: tempCard.cardBrand,
        cardNumber: tempCard.cardNumber,
        cardExpiration: tempCard.cardExpiration,
        cardColor: tempCard.cardColor,
        cardNickname: tempCard.cardNickname,
        cardBalance: parseFloat(tempCard.cardBalance) || 0
      });
      setShowCardModal(false);
      toast({ title: 'Cartão atualizado', tone: 'success' });
    } catch (err) {
      toast({ title: 'Não foi possível salvar o cartão', tone: 'error' });
    }
  };

  const handleExecuteTx = async (e) => {
    e.preventDefault();
    const val = parseFloat(tempTxValue) || 0;
    if (val <= 0) return;

    const isSaque = txModalType === 'saque';
    const nome = tempTxDesc.trim() || (isSaque ? 'Retirada' : 'Depósito');

    const newBalance = isSaque ? Math.max(0, totalBalance - val) : totalBalance + val;
    const newSpending = isSaque ? totalSpending + val : totalSpending;
    const newCardBalance = isSaque ? Math.max(0, cardBalance - val) : cardBalance + val;

    try {
      await registrarTransacao({
        nome,
        valor: isSaque ? -val : val,
        categoria: isSaque ? 'Saque' : 'Depósito',
        icone: isSaque ? 'ArrowDownRight' : 'Wallet'
      });
      await salvarResumo({ totalBalance: newBalance, totalSpending: newSpending, cardBalance: newCardBalance });
      setTxModalType(null);
      toast({ title: isSaque ? 'Retirada registrada' : 'Depósito registrado', description: brl(val), tone: 'success' });
    } catch (err) {
      toast({ title: 'Não foi possível registrar', tone: 'error' });
    }
  };

  // Exclui um lançamento e desfaz o efeito dele nos totais (o inverso do que foi feito ao registrar)
  const excluirTransacao = async (tx) => {
    const valor = Math.abs(tx.valor || 0);
    const ok = await confirm({
      title: `Excluir "${tx.nome}"?`,
      description: `O lançamento de ${brl(valor)} sai da lista e os totais são ajustados como se ele nunca tivesse existido.`,
      confirmLabel: 'Excluir',
      destructive: true
    });
    if (!ok) return;

    let { totalBalance: saldo, totalSpending: gasto, totalSaved: guardado, cardBalance: cartao } = resumo;
    if (tx.valor >= 0) {
      saldo -= valor;
      if (tx.categoria === 'Depósito') cartao -= valor;
    } else if (tx.categoria === 'Reserva') {
      saldo += valor;
      guardado -= valor;
    } else {
      saldo += valor;
      gasto -= valor;
      if (tx.categoria === 'Saque') cartao += valor;
    }

    try {
      await deleteDoc(doc(db, COL.financasTransacoes, tx.id));
      await salvarResumo({
        totalBalance: saldo,
        totalSpending: Math.max(0, gasto),
        totalSaved: Math.max(0, guardado),
        cardBalance: Math.max(0, cartao)
      });
      toast({ title: 'Lançamento excluído', description: tx.nome });
    } catch (err) {
      toast({ title: 'Não foi possível excluir', tone: 'error' });
    }
  };

  const handleResetAllData = async () => {
    const ok = await confirm({
      title: 'Zerar todas as finanças?',
      description: 'Saldo, gastos, reserva e todas as transações serão apagados. Não dá para desfazer.',
      confirmLabel: 'Zerar tudo',
      destructive: true
    });
    if (!ok) return;
    try {
      await salvarResumo({ totalBalance: 0, totalSpending: 0, totalSaved: 0, cardBalance: 0 });
      for (const tx of transacoes) {
        await deleteDoc(doc(db, COL.financasTransacoes, tx.id));
      }
      toast({ title: 'Finanças zeradas' });
    } catch (err) {
      toast({ title: 'Não foi possível zerar os dados', tone: 'error' });
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    const texto = inputText.trim();
    if (!texto) return;
    const result = processarLancamento(texto);
    if (result.success) {
      handleUpdateFinanceData(result);
    }
    setMensagens((prev) => [{ id: Date.now(), texto, ...result }, ...prev].slice(0, 4));
    setInputText('');
  };

  const abrirTx = (tipo) => {
    setTempTxValue('');
    setTempTxDesc('');
    setTxModalType(tipo);
  };

  const abrirSaldos = () => {
    setTempBalance(String(totalBalance));
    setTempSaved(String(totalSaved));
    setShowBalanceModal(true);
  };

  const abrirCartao = () => {
    setTempCard({ ...resumo, cardColor: CARD_STYLES[resumo.cardColor] ? resumo.cardColor : 'black', cardBalance: String(cardBalance) });
    setShowCardModal(true);
  };

  // Entradas e saídas dos últimos 6 meses, agrupadas pela data de criação
  const fluxoMensal = useMemo(() => {
    const now = new Date();
    const meses = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
      return {
        key: `${d.getFullYear()}-${d.getMonth()}`,
        short: MESES[d.getMonth()],
        label: `${MESES[d.getMonth()]} ${d.getFullYear()}`,
        entradas: 0,
        saidas: 0
      };
    });
    transacoes.forEach((tx) => {
      if (!tx.createdAt) return;
      const d = new Date(tx.createdAt);
      const m = meses.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}`);
      if (!m) return;
      if (tx.valor >= 0) m.entradas += tx.valor;
      else m.saidas += Math.abs(tx.valor);
    });
    return meses;
  }, [transacoes]);

  const txFiltradas = transacoes.filter((tx) =>
    filtroTx === 'todas' ? true : filtroTx === 'entradas' ? tx.valor >= 0 : tx.valor < 0
  );

  return (
    <ModuleFrame
      id="financas"
      index="02"
      image={FinancasImg}
      title="Finanças"
      phrase="Quanto entrou, quanto saiu e quanto ficou guardado. Sem planilha."
      cta="Abrir minhas finanças"
      stats={[
        { label: 'Saldo', value: brl(totalBalance) },
        { label: 'Guardado', value: brl(totalSaved) },
        { label: 'Lançamentos', value: transacoes.length }
      ]}
      actions={
        <>
          <Button variant="outline" onClick={() => abrirTx('saque')}><Minus /> Retirar</Button>
          <Button onClick={() => abrirTx('deposito')}><Plus /> Depositar</Button>
        </>
      }
    >
      {/* Saldos: números grandes, sem caixas */}
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-[1.4fr_1fr_1fr] sm:items-end">
        <button onClick={abrirSaldos} className="group text-left">
          <span className="flex items-center gap-2 text-sm text-ink-400">
            Saldo principal
            <Pencil className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100 [@media(hover:none)]:opacity-60" />
          </span>
          <AnimatedMoney
            value={totalBalance}
            className="mt-2 block font-mono text-5xl tracking-[-0.04em] text-ink-50 transition-colors group-hover:text-lime sm:text-6xl"
          />
        </button>
        <div className="border-l border-ink-800 pl-5">
          <span className="flex items-center gap-1.5 text-sm text-ink-400">
            <ArrowDownRight className="h-3.5 w-3.5" /> Total gasto
          </span>
          <AnimatedMoney value={totalSpending} className="mt-2 block font-mono text-2xl tracking-tight text-ink-100" />
        </div>
        <div className="border-l border-ink-800 pl-5">
          <span className="flex items-center gap-1.5 text-sm text-ink-400">
            <PiggyBank className="h-3.5 w-3.5" /> Reserva
          </span>
          <AnimatedMoney value={totalSaved} className="mt-2 block font-mono text-2xl tracking-tight text-lime" />
        </div>
      </div>

      <div className="mt-12 grid grid-cols-[minmax(0,1fr)] gap-x-12 gap-y-12 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {/* Gráfico */}
        <Section title="Entradas e saídas" description="Últimos 6 meses">
          <CashflowChart data={fluxoMensal} />
        </Section>

        {/* Cartão */}
        <Section
          title="Cartão"
          icon={CreditCard}
          action={<Button variant="ghost" size="sm" onClick={abrirCartao}><Pencil /> Editar</Button>}
        >
          <motion.div
            whileHover={{ rotateX: 6, rotateY: -8, y: -2 }}
            transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            style={{ transformPerspective: 800 }}
            className={cn('relative flex aspect-[1.6/1] flex-col justify-between overflow-hidden rounded-xl p-5', cardStyle(resumo.cardColor))}
          >
            <div className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full border border-current opacity-10" />
            <div className="pointer-events-none absolute -right-2 -top-24 h-44 w-44 rounded-full border border-current opacity-10" />
            <div className="flex items-start justify-between">
              <span className="text-sm font-medium opacity-80">{resumo.cardNickname}</span>
              <span className="font-mono text-sm font-semibold italic">{resumo.cardBrand}</span>
            </div>
            <div>
              <AnimatedMoney value={cardBalance} className="block font-mono text-2xl tracking-tight" />
              <div className="mt-2 flex justify-between font-mono text-xs opacity-70">
                <span>{resumo.cardNumber}</span>
                <span>{resumo.cardExpiration}</span>
              </div>
            </div>
          </motion.div>
          <div className="mt-2 flex gap-2 text-sm">
            <button onClick={() => abrirTx('saque')} className="flex items-center gap-1.5 py-2.5 pr-2 text-ink-300 transition-colors hover:text-ink-50">
              <ArrowDownRight className="h-4 w-4" /> Retirar
            </button>
            <button onClick={() => abrirTx('deposito')} className="flex items-center gap-1.5 px-2 py-2.5 text-ink-300 transition-colors hover:text-ink-50">
              <ArrowUpRight className="h-4 w-4" /> Depositar
            </button>
          </div>
        </Section>

        {/* Transações */}
        <Section
          title="Transações"
          action={
            <div className="flex items-center gap-2">
              <Segmented
                size="sm"
                layoutId="fin-filtro"
                value={filtroTx}
                onChange={setFiltroTx}
                options={[
                  { value: 'todas', label: 'Todas' },
                  { value: 'entradas', label: 'Entradas' },
                  { value: 'saidas', label: 'Saídas' }
                ]}
              />
              {transacoes.length > 0 && (
                <Button variant="ghost" size="icon-sm" onClick={handleResetAllData} title="Zerar finanças" aria-label="Zerar finanças">
                  <RotateCcw />
                </Button>
              )}
            </div>
          }
        >
          {txFiltradas.length === 0 ? (
            <EmptyState
              icon={Wallet}
              title="Nenhuma transação"
              description="Use Depositar, Retirar ou o lançamento rápido."
            />
          ) : (
            <ul className="max-h-[440px] divide-y divide-ink-800/70 overflow-y-auto">
              <AnimatePresence initial={false}>
                {txFiltradas.map((tx) => {
                  const Icon = getTxIcon(tx.icone);
                  const entrada = tx.valor >= 0;
                  return (
                    <motion.li
                      key={tx.id}
                      layout
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 24, transition: { duration: 0.2 } }}
                      className="group flex items-center gap-4 py-3"
                    >
                      <Icon className={cn('h-4 w-4 shrink-0', entrada ? 'text-lime' : 'text-ink-500')} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm text-ink-50">{tx.nome}</p>
                        <p className="text-xs text-ink-500">{tx.categoria} · {tx.data}</p>
                      </div>
                      <span className={cn('font-mono text-sm tabular-nums', entrada ? 'text-lime' : 'text-ink-200')}>
                        {entrada ? '+' : '−'} {brl(Math.abs(tx.valor))}
                      </span>
                      <QuickDelete label={`Excluir ${tx.nome}`} onClick={() => excluirTransacao(tx)} className="shrink-0" />
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          )}
        </Section>

        {/* Lançamento rápido */}
        <Section title="Lançamento rápido" icon={Zap} description='Escreva como fala: "gastei 32 no almoço".'>
          <form onSubmit={handleSendMessage}>
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="recebi 400 de freelance"
              trailing={
                <Button type="submit" size="icon-sm" variant="secondary" aria-label="Lançar">
                  <Send />
                </Button>
              }
            />
          </form>
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
            {['gastei 25 no lanche', 'recebi 800 de bolsa', 'guardei 100'].map((ex) => (
              <button
                key={ex}
                onClick={() => setInputText(ex)}
                className="font-mono text-xs text-ink-500 underline-offset-4 transition-colors hover:text-ink-100 hover:underline"
              >
                {ex}
              </button>
            ))}
          </div>
          <ul className="mt-5 flex flex-col gap-3">
            <AnimatePresence initial={false}>
              {mensagens.map((m) => (
                <motion.li
                  key={m.id}
                  layout
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn('border-l-2 py-0.5 pl-3', m.success ? 'border-lime' : 'border-ink-700')}
                >
                  <p className="font-mono text-xs text-ink-500">&gt; {m.texto}</p>
                  <p className={cn('mt-1 text-sm', m.success ? 'text-ink-50' : 'text-ink-300')}>{m.reply}</p>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </Section>
      </div>

      {/* Ajustar saldos */}
      <Dialog
        open={showBalanceModal}
        onClose={() => setShowBalanceModal(false)}
        title="Ajustar saldos"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowBalanceModal(false)}>Cancelar</Button>
            <Button type="submit" form="saldo-form">Salvar</Button>
          </>
        }
      >
        <form id="saldo-form" onSubmit={handleSaveBalance} className="flex flex-col gap-4">
          <TextField label="Saldo principal (R$)" type="number" step="0.01" value={tempBalance} onChange={(e) => setTempBalance(e.target.value)} autoFocus />
          <TextField label="Reserva para estudos (R$)" type="number" step="0.01" value={tempSaved} onChange={(e) => setTempSaved(e.target.value)} />
        </form>
      </Dialog>

      {/* Cartão */}
      <Dialog
        open={showCardModal}
        onClose={() => setShowCardModal(false)}
        title="Configurar cartão"
        footer={
          <>
            <Button variant="ghost" onClick={() => setShowCardModal(false)}>Cancelar</Button>
            <Button type="submit" form="cartao-form">Salvar cartão</Button>
          </>
        }
      >
        <form id="cartao-form" onSubmit={handleSaveCard} className="grid gap-4 sm:grid-cols-2">
          <TextField label="Apelido" placeholder="Nubank, Principal..." value={tempCard.cardNickname} onChange={(e) => setTempCard({ ...tempCard, cardNickname: e.target.value })} />
          <Field label="Bandeira">
            <Select value={tempCard.cardBrand} onChange={(e) => setTempCard({ ...tempCard, cardBrand: e.target.value })}>
              {['VISA', 'MASTERCARD', 'ELO', 'AMEX'].map((b) => <option key={b} value={b}>{b}</option>)}
            </Select>
          </Field>
          <TextField label="Número" placeholder="**** **** **** 4321" value={tempCard.cardNumber} onChange={(e) => setTempCard({ ...tempCard, cardNumber: e.target.value })} />
          <TextField label="Validade" placeholder="08/30" value={tempCard.cardExpiration} onChange={(e) => setTempCard({ ...tempCard, cardExpiration: e.target.value })} />
          <TextField className="sm:col-span-2" label="Saldo ou limite (R$)" type="number" step="0.01" value={tempCard.cardBalance} onChange={(e) => setTempCard({ ...tempCard, cardBalance: e.target.value })} />
          <Field label="Estilo" className="sm:col-span-2">
            <div className="flex gap-2">
              {Object.keys(CARD_STYLES).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setTempCard({ ...tempCard, cardColor: c })}
                  aria-label={`Cartão ${c}`}
                  className={cn(
                    'h-10 w-16 rounded-lg transition-all',
                    CARD_STYLES[c],
                    tempCard.cardColor === c ? 'ring-2 ring-ink-50 ring-offset-2 ring-offset-ink-900' : 'opacity-70 hover:opacity-100'
                  )}
                />
              ))}
            </div>
          </Field>
        </form>
      </Dialog>

      {/* Saque / depósito */}
      <Dialog
        open={!!txModalType}
        onClose={() => setTxModalType(null)}
        title={txModalType === 'saque' ? 'Registrar retirada' : 'Registrar depósito'}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setTxModalType(null)}>Cancelar</Button>
            <Button type="submit" form="tx-form">{txModalType === 'saque' ? 'Retirar' : 'Depositar'}</Button>
          </>
        }
      >
        <form id="tx-form" onSubmit={handleExecuteTx} className="flex flex-col gap-4">
          <TextField label="Valor (R$)" type="number" step="0.01" min="0.01" placeholder="150,00" value={tempTxValue} onChange={(e) => setTempTxValue(e.target.value)} autoFocus required />
          <TextField
            label="Descrição"
            placeholder={txModalType === 'saque' ? 'Saque em espécie' : 'Depósito semanal'}
            value={tempTxDesc}
            onChange={(e) => setTempTxDesc(e.target.value)}
          />
        </form>
      </Dialog>
    </ModuleFrame>
  );
}
