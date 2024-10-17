import { useEffect, useMemo, useRef, useState } from 'react';
import './index.css';

const parseTextResponse = text => {
  try {
    const parsed = JSON.parse(text);
    if(typeof parsed === 'string') return {from: 'system', message: parsed};
    if(Array.isArray(parsed)) return parsed[0];
    return parsed;
  } catch (error) {
    if(text.length > 0){
      if(/(\{|,)(\w+)(:|\})/g.test(text)) return parseTextResponse(text.replace(/(\{|,)(\w+)(:|\})/g, '$1"$2"$3'));
      return {from: 'system', message: text};
    }
    console.log({error, text});
    return {from: 'system', message: 'sorry, something went wrong. Please try again'}
  }
}

const Llm = () => {
  const [context, setContext] = useState([]);
  const [prompt, setPrompt] = useState('');
  const bodyRef = useRef(null)
  const sessionRef = useRef(null);

  const process = useMemo(() => async () => {
    if(!sessionRef.current) alert('AI not found in window!');
    if (!context.length) return console.log('empty context');
    console.log({context})
    let localPrompt = context?.[0]?.message;
    if (context.some(({from}) => from === 'system')) {
      localPrompt = `continue the conversation, answer as the object from system: ${JSON.stringify(context)}`;
    }else if (context.length > 1) {
      localPrompt = `continue the conversation, answer as the object from user but insert value 'system': ${JSON.stringify(context)}`;
    }
    console.log({localPrompt})
    const result = await sessionRef.current.prompt(localPrompt);
    const parsed = parseTextResponse(result);
    console.log({parsed});
    setContext(prevState => ([...prevState, parsed]));
  }, [context, sessionRef, setContext]);

  const createSession = async () => {
    const session = await window?.ai?.languageModel?.create?.();
    sessionRef.current = session;
  }

  useEffect(() => {
    if(sessionRef.current) return;
    createSession();
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!prompt) return;
    setContext((prevState) => ([...prevState, {from: 'user', message: prompt}]));
    setPrompt('');
  };

  useEffect(() => {
    if (!bodyRef.current) return;
    if (context?.[context?.length -1]?.from === 'user') process();
    bodyRef.current.scrollTo(0, bodyRef.current.scrollHeight)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [context])

  return (
    <>
      <section className="llm">
        <section ref={bodyRef}>
          {context.map(({ from, message }, index) => (
            <span className={from} key={`message-${index}`}>
              {message}
            </span>
          ))}
        </section>
        <footer>
          <textarea
            placeholder="Type your prompt here"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          ></textarea>
          <button onClick={onSubmit}>send</button>
        </footer>
      </section>
    </>
  );
};

export default Llm;
