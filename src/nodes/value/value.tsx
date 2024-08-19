import React, {InputHTMLAttributes} from "react";

export default class {
    ver: string = '0.0.0';
    name = 'value';
    color = '#ebf5ec';
    inputs = [];
    outputs = ['x'];
    cfg = {
        'основная': [
            {name: 'valueA', type: 'number', val: 1, title: 'Значение-A', arrOption: ['2']},
            {name: 'valueB', type: 'number', val: 2, title: 'Значение-B', arrOption: ['2']},
            {name: 'valueC', type: 'number2', val: 0, title: 'Значение-C', arrOption: ['2']},
            {name: 'valueG', type: 'number2', val: 0, title: 'Значение-G', arrOption: ['2']},
            {name: 'valueH', type: 'number2', val: 0, title: 'Значение-H', arrOption: ['3']},
            {name: 'valueI', type: 'number2', val: 0, title: 'Значение-I', arrOption: ['3']},
            {name: 'valueI', type: 'number2', val: 0, title: 'Значение-I', arrOption: ['3']},
            {name: 'valueI', type: 'number2', val: 0, title: 'Значение-I', arrOption: ['3']},
            {name: 'valueI', type: 'number2', val: 0, title: 'Значение-I', arrOption: ['3']},
            {name: 'valueI', type: 'number2', val: 0, title: 'Значение-I', arrOption: ['3']},
            {name: 'valueI', type: 'number2', val: 0, title: 'Значение-I', arrOption: ['3']},
        ],
        'вторая': [
            {name: 'valueD', type: 'number', val: 1, title: 'Значение-D'},
            {name: 'valueE', type: 'number', val: 2, title: 'Значение-E'},
            {name: 'valueF', type: 'number', val: 0, title: 'Значение-F'},
        ],
        'сеть': [
            {name: 'ip', type: 'string', val: '192.168.0.3', title: 'ip-адрес', arrOption: []},
        ],
        'инфо': [
            {
                name: 'description', type: 'string', val: 'Описание',
                arrOption: ['inline', 'right', 'hr']
            },
        ],
        'jhjhd': [
            {
                name: 'description', type: 'string', val: 'Описание2',
                arrOption: ['inline', 'left', 'hr']
            },
        ],
    };
    components = {
        'number2': function ({name, val, onChange}) {
            return <input className="prop__param__number" type="number" defaultValue={val}
                          onBlur={({target}) => {
                              console.log(Number(target.value) + 'N2')
                              onChange(name, Number(target.value), val)
                          }}
                          onKeyDown={({target, key}) => {
                              if (key == 'Enter') onChange(name, Number((target as InputHTMLAttributes<string>).value), val)
                          }}/>
        },
    }
    icon = 'url("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAyMy4xLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0i0KHQu9C+0LlfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiDQoJIHZpZXdCb3g9IjAgMCAyNSAyNSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjUgMjU7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI+DQoJLnN0MHtkaXNwbGF5Om5vbmU7fQ0KCS5zdDF7ZGlzcGxheTppbmxpbmU7fQ0KCS5zdDJ7ZmlsbDojRkZGRkZGO30NCgkuc3Qze2ZpbGw6I0NFQ0VDRTt9DQoJLnN0NHtmaWxsOiM3MjcyNzE7fQ0KCS5zdDV7ZmlsbDpub25lO3N0cm9rZTojMDAwMDAwO3N0cm9rZS1taXRlcmxpbWl0OjEwO30NCgkuc3Q2e2ZpbGw6I0NBQ0FDQTt9DQo8L3N0eWxlPg0KPGcgY2xhc3M9InN0MCI+DQoJPGcgY2xhc3M9InN0MSI+DQoJCTxwYXRoIGNsYXNzPSJzdDIiIGQ9Ik0xNy42LDEwLjVDMTcsOS4xLDE1LjksOCwxNC41LDcuNFYxLjZjNC41LDEsNy45LDQuNCw4LjksOC45SDE3LjZ6Ii8+DQoJCTxwYXRoIGQ9Ik0xNSwyLjJjMy44LDEsNi43LDQsNy44LDcuOGgtNC45Yy0wLjYtMS4yLTEuNi0yLjMtMi45LTIuOVYyLjIgTTE0LDF2Ni44YzEuNSwwLjYsMi43LDEuNywzLjIsMy4ySDI0DQoJCQlDMjMuMiw1LjksMTkuMSwxLjgsMTQsMUwxNCwxeiIvPg0KCTwvZz4NCgk8ZyBjbGFzcz0ic3QxIj4NCgkJPHBhdGggY2xhc3M9InN0MyIgZD0iTTEyLjEsMjMuNUM2LjMsMjMuMywxLjcsMTguNywxLjUsMTIuOWMtMC4xLTMsMS01LjksMy4xLTguMWMyLTIuMSw0LjYtMy4yLDcuNC0zLjR2NS4zYy0xLjYsMC4xLTMsMC45LTQsMi4xDQoJCQljLTEuMSwxLjQtMS41LDMuMS0xLjIsNC45YzAuNSwyLjIsMi4yLDQsNC40LDQuNGMwLjQsMC4xLDAuOCwwLjEsMS4yLDAuMWMzLDAsNS41LTIuMyw1LjctNS4zaDUuM2MtMC4xLDIuOC0xLjMsNS4zLTMuMiw3LjMNCgkJCWMtMi4xLDIuMS00LjgsMy4yLTcuOCwzLjJDMTIuNSwyMy41LDEyLjIsMjMuNSwxMi4xLDIzLjV6Ii8+DQoJCTxwYXRoIGQ9Ik0xMS41LDJ2NC4zYy0xLjUsMC4yLTIuOSwxLTMuOSwyLjJDNi40LDEwLDYsMTIsNi40LDEzLjhjMC41LDIuNCwyLjQsNC4zLDQuOCw0LjhjMC40LDAuMSwwLjksMC4xLDEuMywwLjENCgkJCWMzLjEsMCw1LjctMi4zLDYuMi01LjNIMjNjLTAuNSw1LjMtNSw5LjUtMTAuNSw5LjVjLTAuMSwwLTAuMywwLTAuNCwwQzYuNywyMi44LDIuMiwxOC4zLDIsMTIuOUMxLjksMTAsMi45LDcuMyw0LjksNS4yDQoJCQlDNi43LDMuNCw5LDIuMywxMS41LDIgTTEyLjUsMUM2LDEsMC43LDYuNCwxLDEzQzEuMiwxOC45LDYuMSwyMy44LDEyLDI0YzAuMiwwLDAuMywwLDAuNSwwQzE4LjgsMjQsMjQsMTguOSwyNCwxMi41aC02LjMNCgkJCWMwLDIuOS0yLjMsNS4zLTUuMyw1LjNjLTAuNCwwLTAuNywwLTEuMS0wLjFjLTItMC40LTMuNi0yLTQtNGMtMC43LTMuNCwxLjktNi40LDUuMS02LjRWMUwxMi41LDF6Ii8+DQoJPC9nPg0KPC9nPg0KPGc+DQoJPHJlY3QgeD0iMC41IiB5PSI3LjUiIGNsYXNzPSJzdDIiIHdpZHRoPSIyNCIgaGVpZ2h0PSIxNyIvPg0KCTxwYXRoIGQ9Ik0yNCw4djE2SDFWOEgyNCBNMjUsN0gwdjE4aDI1VjdMMjUsN3oiLz4NCjwvZz4NCjxnPg0KCTxyZWN0IHg9IjAuNSIgeT0iMi41IiBjbGFzcz0ic3Q0IiB3aWR0aD0iMjQiIGhlaWdodD0iNSIvPg0KCTxwYXRoIGQ9Ik0yNCwzdjRIMVYzSDI0IE0yNSwySDB2NmgyNVYyTDI1LDJ6Ii8+DQo8L2c+DQo8Zz4NCgk8Zz4NCgkJPGxpbmUgY2xhc3M9InN0NSIgeDE9IjMiIHkxPSIxMS41IiB4Mj0iMjIiIHkyPSIxMS41Ii8+DQoJPC9nPg0KCTxnPg0KCQk8bGluZSBjbGFzcz0ic3Q1IiB4MT0iMyIgeTE9IjE0LjUiIHgyPSIyMiIgeTI9IjE0LjUiLz4NCgk8L2c+DQoJPGc+DQoJCTxsaW5lIGNsYXNzPSJzdDUiIHgxPSIzIiB5MT0iMTcuNSIgeDI9IjIyIiB5Mj0iMTcuNSIvPg0KCTwvZz4NCgk8Zz4NCgkJPGxpbmUgY2xhc3M9InN0NSIgeDE9IjMiIHkxPSIyMC41IiB4Mj0iMjIiIHkyPSIyMC41Ii8+DQoJPC9nPg0KCTxnPg0KCQk8bGluZSBjbGFzcz0ic3Q1IiB4MT0iMTkuNSIgeTE9IjkiIHgyPSIxOS41IiB5Mj0iMjMiLz4NCgk8L2c+DQoJPGc+DQoJCTxsaW5lIGNsYXNzPSJzdDUiIHgxPSIxNC41IiB5MT0iOSIgeDI9IjE0LjUiIHkyPSIyMyIvPg0KCTwvZz4NCgk8Zz4NCgkJPGxpbmUgY2xhc3M9InN0NSIgeDE9IjkuNSIgeTE9IjkiIHgyPSI5LjUiIHkyPSIyMyIvPg0KCTwvZz4NCgk8Zz4NCgkJPGxpbmUgY2xhc3M9InN0NSIgeDE9IjUuNSIgeTE9IjkiIHgyPSI1LjUiIHkyPSIyMyIvPg0KCTwvZz4NCjwvZz4NCjxnPg0KCTxyZWN0IHg9IjMuNSIgeT0iMC41IiBjbGFzcz0ic3Q2IiB3aWR0aD0iNCIgaGVpZ2h0PSI0Ii8+DQoJPHBhdGggZD0iTTcsMXYzSDRWMUg3IE04LDBIM3Y1aDVWMEw4LDB6Ii8+DQo8L2c+DQo8Zz4NCgk8cmVjdCB4PSIxNy41IiB5PSIwLjUiIGNsYXNzPSJzdDYiIHdpZHRoPSI0IiBoZWlnaHQ9IjQiLz4NCgk8cGF0aCBkPSJNMjEsMXYzaC0zVjFIMjEgTTIyLDBoLTV2NWg1VjBMMjIsMHoiLz4NCjwvZz4NCjwvc3ZnPg0K")'
}