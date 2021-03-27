import React, { useState, useEffect } from 'react';
import Output from './components/Output';
import TopBar from './components/TopBar';
import Input from './components/Input';
import { getIntrospectionQuery, buildClientSchema } from 'graphql';

export default function App() {
  const [input, setInput] = useState('');
  const [selection, setSelection] = useState('');

  const [results, setResults] = useState('');
  const [querySubjects, setQuerySubjects] = useState('');
  const [schema, setSchema] = useState('');

  /*
query {
  continents {
    name
  }
}

query {
  countries {
    name
  }
}

query {
  languages {
    name
  }
}
=============================================
query {
  continents {
    name
  }
}

query {
  continents {
    code
  }
}
*/

  const outputs = [];
  for (let i = 0; i < querySubjects.length; i++){
    outputs.push(<Output key={i} id={i} language='javascript' value={results[querySubjects[i]]} />)
  }

  useEffect(() => {
    // 'https://graphql-pokemon2.vercel.app'
    fetch('https://countries.trevorblades.com/', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: getIntrospectionQuery(),
      }),
    })
      .then((res) => res.json())
      .then((schemaJSON) => {
        console.log(schemaJSON);
        setSchema(buildClientSchema(schemaJSON.data));
        console.log(buildClientSchema(schemaJSON.data));
      });
  }, []);

  return (
    <div className="main-container">
    <TopBar input={input} selection={selection} setResults={setResults} setQuerySubjects={setQuerySubjects} />

      <div className="io-container">
        <Input
          value={input}
          onChange={setInput}
          selection={selection}
          onSelectionChange={setSelection}
          schema={schema}
        />
        <div className="output-container-outer output-container-outer--nord">

          {outputs}

        </div>
      </div>
    </div>
  );
}
