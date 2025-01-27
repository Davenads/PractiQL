import React, { useState } from 'react';

//  https://countries.trevorblades.com/
export default function TopBar(props) {
  const { endpoint, input, selection, setResults, setQuerySubjects } = props;

  const handleClick = () => {
    //LocalStorage
    localStorage.setItem('PractiQL', input.trim());

    const sel = selection ? selection.trim() : input.trim();
  
    const isMutation = sel.includes('mutation');
    
    let myQuery;
    if (isMutation) {
      myQuery = 'mutation {\r\n';
    } else {
      myQuery = 'query myquery {\r\n';
    }
    const arrItems = matchRecursiveRegExp(sel, '{', '}');

    let querySubjects = [];

    
    for (let i = 0; i < arrItems.length; i++) {
      const x = arrItems[i];
      // IS THIS A MERGED QUERY?
      if (x.includes(',')) {
        const items = x.split(',');

        for (let i = 0; i < items.length; i++) {
          // DOES THIS item HAVE AN ALIAS?
          if (items[i].includes(':')) {
            querySubjects.push(
              items[i].substring(0, items[i].indexOf(':')).trim()
            );

            myQuery += items[i] + (i < items.length - 1 ? ',\r\n' : '\r\n');
          } else {
            // ADD ALIAS TO RETURN MULTIPLE RESULTSETS
            const alias =
              items[i].substring(0, items[i].indexOf('{')).trim() +
              '_' +
              i.toString();
            querySubjects.push(alias);

            myQuery +=
              alias +
              ' : ' +
              items[i] +
              (i < items.length - 1 ? ',\r\n' : '\r\n');
          }
        }
      } else {
        // DOES THIS item HAVE AN ALIAS?
        let test = x.substring(0, x.indexOf(':')).trim();
        if (test.indexOf('(') > 0) {
          if (x.trimStart().startsWith('__')) {
            querySubjects.push(x.substring(0, x.indexOf('{')).trim());
          } else {
            querySubjects.push(x.substring(0, x.indexOf('(')).trim());
          }
          myQuery += arrItems[i].trim();
        } else {
          let alias;
          const query = x.substring(0, x.indexOf('{')).trim();
          const repeat = querySubjects.includes(query);
          if (repeat) {
            // CREATE AN ALIAS
            alias = query + '_' + i.toString();
          }

          querySubjects.push(repeat ? alias : query);
          myQuery +=
            (repeat ? alias + ' : ' : '') +
            arrItems[i].trim() +
            (i < arrItems.length - 1 ? ',\r\n' : '\r\n');
        }
      }
    }

    myQuery += '}';
    
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: myQuery,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.errors) {
          setResults(data.errors);
          return;
        }

        // SET STATE - results
        setResults(data.data);
        setQuerySubjects(querySubjects);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  function matchRecursiveRegExp(str, left, right) {
    const x = new RegExp(left + '|' + right, 'g');
    const l = new RegExp(left);
    let a = [];
    let t, s, m;

    t = 0;

    while ((m = x.exec(str))) {
      if (l.test(m[0])) {
        if (!t++) {
          s = x.lastIndex;
        }
      } else if (t) {
        if (!--t) {
          a.push(str.slice(s, m.index));
        }
      }
    }
    return a;
  }

  function handleBtnClick() {
    // passes value of input to props.handleBtnClick
    const inputValue = document.getElementById('endpoint-input').value;
    props.handleBtnClick(inputValue);

    let count = 6;
    let toggle = false;
    const color = inputValue ? '#a9d0c6' : 'red';

    const intervalID = setInterval(() => {
      const endpointIcon = document.getElementById('endpoint-input-icon');
      if (!toggle) endpointIcon.style.color = color;
      else endpointIcon.style.color = 'gray';
      toggle = !toggle;
      count--;
      if (count === 0) clearInterval(intervalID);
    }, 175);
  }

  // Sets keyboard shortcut for sending queries
  if (props.editor !== '') {
    const editor = props.editor;
    const keyMap = {
      'Ctrl-Enter': handleClick,
    };
    editor.addKeyMap(keyMap);
  }

  // Sets enter shortcut for endpoint input
  function handleChange(e) {
    if (e.charCode === 13) handleBtnClick();
  }
  return (
    <div id='top-bar' className='top-bar top-bar--nord'>
      {/* <span className="logo logo--nord">PractiQL</span> */}

      <svg width='200' height='150' viewBox='0 0 490 84'>
        <path
          d='M34.62 80.835l-1.888-.343-2.08-.597-2.08-.597-2.425-1.125-2.425-1.125-3.75-2.426v-.791l.728-.381.728-.381.912-.949.912-.949h.617l4.784 2.662 4.682 1.609 4.498.754 6.778.002 3.805-.561 4.233-1.372 3.704-1.716 2.876-1.854.696.267v.43l3.44 2.525v.174l-4.366 2.834-3.175 1.591-5.556 1.892-2.35.407-2.35.407-9.059-.048-1.888-.343zm373.68-6.677l-2.168-4.422-10.848.136-6.257-.528-4.591-1.124-4.762-2.299-3.596-2.983-2.414-3.275-1.72-3.44-1.122-3.44-.399-1.921-.399-1.921-.275-3.625-.275-3.625.272-3.611.272-3.611.269-1.427.269-1.427.506-1.852.506-1.852.799-1.781.799-1.781 2.1-3.093 3.934-3.664 4.179-2.214 4.501-1.303 5.075-.639 15.03.258 3.969.903 2.04.785 2.039.785 1.929 1.263 1.929 1.263 3.274 3.512 2.108 3.588.83 2.381.83 2.381.521 3.043.522 3.043.003 4.789.003 4.789-.421 2.835-.421 2.835-.783 2.397-.783 2.398-.939 1.786-.939 1.786-1.42 1.722-1.421 1.722-1.54 1.175-1.54 1.175-2.249 1.247v.417l4.762 9.998v.865h-9.818l-2.168-4.422zm-7.063-14.59v-.226l-5.027-10.627v-.839l9.891.144 2.263 4.762 2.263 4.762.25.179.25.179 1.361-.704 2.807-2.968.745-1.65.745-1.65.493-2.117.493-2.117-.009-5.159-.009-5.159-.58-2.311-.58-2.311-.82-1.625-.82-1.625-1.305-1.305-1.305-1.305-3.347-1.566-4.104-.785h-12.078l-4.148.787-3.795 1.867-2.423 2.695-.788 1.651-.788 1.651-.415 1.791-.415 1.791-.251 2.855-.251 2.855.498 6.115.44 1.794.44 1.794 1.511 3.212 1.056 1.2 1.056 1.2 1.798.941 1.798.941 1.191.322 1.191.322 3.969.39 6.747.074zM9.027 71.329l-1.553-.653-.674-.612-.674-.612-1.516-1.588-.71-1.323-.71-1.323-.018-6.35 1.442-2.405 1.214-1.267 1.214-1.267L8.5 53.26l1.458-.668 5.648.216 2.336 1.22 1.427 1.494 1.427 1.494.524 1.181.524 1.181.32.204.32.204 28.941.008.154-.25.154-.25-2.736-4.66-1.113-1.752-28.718.045-1.18-.608-1.191-1.084.002-2.157 1.135-1.852.49-.86.49-.86.581-.992.581-.992.602-1.154.602-1.154.294-.355.294-.355.462-.872.462-.872 2.818-4.762.579-1.062.579-1.062 1.246-2.113 1.246-2.113.478-.794 1.348-2.381 1.348-2.381.911-1.548.911-1.548-.473-.701-.473-.701-.717-1.359-.717-1.359V9.206l1.921-3.112.919-.947.919-.947 3.213-1.556h4.667l3.414 1.613 2.278 2.311 1.718 3.996-.006 1.663-.006 1.663-1.228 2.986-1.945 2.374-2.038 1.412-1.423.56-1.423.56-4.04-.043-.759 1.235-.759 1.235-.326.529-.326.529-.492.926-.492.926-2.269 3.969-2.363 3.915-.938 1.641-1.526 2.646-1.526 2.646-.586 1.058-.586 1.058-.831 1.401-.831 1.401v.506h7.319l1.602-2.513.747-1.323.747-1.323 1.275-2.145 1.275-2.145v-.376l1.248-1.685.405-.794.405-.794.502-.926.502-.926.496-.746.496-.746.42-.764.42-.764 2.91-5.131.882-1.548.91-1.006 1.734-.325 1.493.716 2.256 3.701.726 1.323.721 1.323.721 1.323.261.319.261.319.918 1.744 1.094 1.852 3.052 5.292.666 1.191.666 1.191.943 1.783.741.863.807 1.588.836 1.455.836 1.455.318.529.318.529 1.714 2.718 5.436.221 2.292 1.195 2.622 2.745.652 1.421.652 1.421v4.625l-1.546 3.381-2.555 2.488-3.175 1.415-4.246.039-3.527-1.651-2.463-2.556-.637-1.248-.637-1.248v-5.391l1.282-2.71 1.099-.995v-.63l-1.257-2.151-1.257-2.151-3.961-6.758-.923-1.852-.511-.794-2.51-4.233-.989-1.852-3.08-5.292h-.938l-.718 1.323-.718 1.323-1.14 2.018-.845 1.289.838 1.279 1.932 3.615 1.158 1.588 1.485 2.91 2.236 3.704 2.286 3.969.411.661.411.661.856 1.588.663 1.191.663 1.191 1.939 3.264v1.796l-.811.777-.811.777-35.376.265-.122.132-.122.132-1.173 2.324-2.454 2.624-2.656 1.37-5.027.182-1.553-.653zm5.328-4.272l.98-.41 1.249-1.165.503-.982.503-.982v-2.423l-1.007-1.963-1.242-1.129-1.693-.856h-2.295l-2.354 1.191-.797 1.147-.797 1.147v3.342l1.666 2.3 2.254 1.192h2.05zm57.921-.658l1.106-.474 1.624-2.242v-3.122l-.76-1.469-2.152-1.945h-3.975l-1.777 1.165-1.39 2.198v2.884l.779 1.228.779 1.228 1.75.911.794.187.794.187 1.323-.261zm-28.041-19.77l-.146-.729-.88-1.453-.88-1.453-.446-.63-.446-.63-.747.287-1.181 2.297-.493.898-.494.898-.279.279-.279.279v.688h6.416zm-.767-30.336l.714-.373.794-.835.794-.835v-4.16l-.553-.747-.553-.747-2.29-1.279-2.161.004-2.276 1.167-.8 1.244-.8 1.244.106 1.37.106 1.37 1.476 1.935 1.659 1.011 3.069.002.714-.373zm54.931 53.194l-.143-.373.175-24.799 1.18-2.938.882-.855.882-.855 1.434-.581 1.434-.581 25.665-.276.926-.423.926-.423 1.746-1.472.688-1.355.688-1.355.126-1.751.126-1.75-.463-1.394-.463-1.394-1.882-2.083-2.153-1.152-31.75-.265v-9.79h33.073l3.43.972 3.044 1.51 2.332 1.604 2.088 2.372 1.687 3.165.523 2.044.523 2.044v6.181l-.53 2.093-.53 2.093-.857 1.72-.857 1.72-3.972 3.969-3.969 1.96-3.44.895-21.96.227-.529.515-.132 10.504-.132 10.504-9.669.144zm57.948.012l-.139-.362.158-35.14.619-1.748.619-1.748 1.935-2.537 1.357-.761 1.357-.761 3.764-.785 20.244.139v8.467l-17.462.266-1.058.482-1.39.962-.991 1.995-.132 15.875-.132 15.875-8.611.145zm53.028.081l-2.024-.194-3.637-1.105-2.899-2.014-1.064-1.584-1.064-1.584-.492-1.455-.492-1.455-.129-3.052-.129-3.052.312-1.504.312-1.504 1.567-3.137 2.315-2.133 2.212-1.129 4.058-1.106 24.606-.317.083-1.984.083-1.984-.588-1.993-1.688-1.922-1.86-.847-28.575-.265v-8.467h30.162l3.402.965 1.327.673 1.327.673 3.072 2.93.677 1.383.677 1.383.429 1.421.429 1.421.202 25.32-.293 1.89-.293 1.89-.649 1.107-.649 1.107-2.807 1.374-2.235.257-2.235.257-21.431-.07zm23.064-9.264l.536-.536-.073-4.425-.073-4.425-22.147-.138-1.019.274-1.019.274-1.61 1.355-.825 2.836.177 1.006.177 1.006.623 1.09.623 1.09 1.738.798.397.144.397.144 21.564.042.536-.536zm39.525 9.253l-2.14-.209-4.181-1.404-1.511-.918-1.511-.918-1.582-1.596-1.582-1.596-1.06-2.038-1.06-2.038-.525-1.896-.525-1.896-.642-5.099.141-3.882.141-3.882.821-3.704.536-1.544.536-1.544 1.617-2.827 2.396-2.664 3.541-2.34 3.755-1.343 2.091-.297 2.091-.297 24.077.156v8.467l-24.871.288-.801.284-.801.284-2.102 1.084-.964 1.015-.964 1.015-.578 1.154-.578 1.154-.409 1.889-.409 1.889.01 3.572.01 3.572.552 2.094.552 2.094 1.322 2.256.992.819.992.819 1.455.589 1.455.59 25.135.265v8.731l-23.283.063-2.14-.209zm51.216 0l-1.988-.214-2.601-.883-1.934-1.221-1.441-1.712-.614-1.219-.614-1.219-.482-1.984-.482-1.984-.146-12.303-.146-12.303-5.556-.265v-8.467l5.556-.265.132-5.027.132-5.027h8.996l.265 10.054 11.906.265v8.467l-11.906.265-.069 11.206-.069 11.206.268.997.268.997.552.701.552.701 1.673.904 8.467.276v8.202l-8.731.068zm23.147-.046l-.129-.337.137-43.392h8.731v43.921l-8.611.145zm113.42.033l-2.477-.222-3.932-1.079-3.576-1.801-1.485-1.209-1.485-1.209-2.366-3.581-1.343-3.755-.296-2.091-.296-2.091.077-19.447.077-19.447h9.79l.137 19.711.137 19.711.32.903.32.903 1.467 2.123 2.381 1.514 3.44 1.131 24.871.305v9.79l-23.283.062zM5.326 49.43l-.165-.617-.004-3.428-.004-3.428.817-5.315 1.104-3.44 1.81-4.233.252-.397.252-.397.251-.578.251-.578 1.453-2.201 1.453-2.201 4.396-4.539 3.704-2.927 5.966-3.303.353.293.353.293.202 1.652.202 1.652.068 1.215-.794.451-.794.451-3.647 2.287-3.563 2.879-3.373 4.039-1.178 1.908-.57 1.058-.57 1.058-.495.702-.495.702v.871l-.877 1.694-1.527 6.085-.026 3.661-.026 3.661-1.115.405-2.646.907-.853.273-.165-.617zm70.075.044l-1.058-.511-1.089-.018-.846-.661-.129-3.969-.129-3.969-.424-1.899-.424-1.899-1.552-4.14-1.545-2.91L67.2 27.87l-1.323-1.668-1.323-1.668-1.922-1.915-1.037-.954-1.037-.954-3.147-2.134-2.91-1.532.036-.917.036-.917.397-3.013.337-.129.337-.129 4.581 2.318 4.282 3.07 5.153 5.12.989 1.541.989 1.541.479.697.479.697 2.744 5.751.652 2.249.652 2.249.36 2.646.36 2.646-.027 6.085-.179.642-.179.642-.257.076-.257.076-1.058-.511zm270.92-30.23l-.133-.346.072-4.754.072-4.754h8.731v10.054l-8.611.145z'
          fill='#a8cfc5'
        />
      </svg>
      <button className='send-btn send-btn--nord' onClick={handleClick}>
        Send
      </button>
      <div className='endpoint-input-wrapper'>
        <div
          onClick={handleBtnClick}
          id='endpoint-input-icon'
          className='endpoint-input-icon'
        >
          ↻
        </div>
        <input
          onKeyPress={handleChange}
          id='endpoint-input'
          className='endpoint-input'
          type='input'
          placeholder={`${endpoint}    ...enter new endpoint here`}
        ></input>
      </div>
    </div>
  );
}
