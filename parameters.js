exports.params = {
  c:                 {sample: 'config.json',   type: 's',  title: 'Path to config file'},
  silent:            {sample: '',              type: 'b',  title: 'Stay silent in console'},
  localServerPort:   {sample: '',              type: 'n',  title: 'Run local web server on given port'},
  dumpFile:          {sample: 'measures.json', type: 's',  title: 'Dump file path'},
  logFile:           {sample: 'log.txt',       type: 's',  title: 'Write log data into given file'},
  v:                 {sample: '',              type: 'b',  title: 'Sets logging level to warn'},
  vv:                {sample: '',              type: 'b',  title: 'Sets logging level to verbose'},
  subPguMos:         {sample: '{"username": "ivanov", "password": "ivanovRocks", "payerId": 1234567890, "flatNumber": 100}', type: 'j', title: 'Pgu.mos.ru submitter config'},
  help:              {sample: '',              type: 'b',  title: 'Display help screen'},
}

