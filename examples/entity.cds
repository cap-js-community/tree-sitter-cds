
entity F {
  key id : String;
};

entity G {} actions {
  action A(P: String, PP: String);
  function A(P: String, PP: String) returns String;
};

entity E @anno (Param: String) : F, G {
  elem: String;
}

entity V as SELECT from E {
  '' || '' as a,
  true as b,
  null as b,
}
