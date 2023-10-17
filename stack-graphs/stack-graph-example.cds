
context C {
  entity E {
    elem: String;
  }

  entity V as SELECT from E;
  //                      ^ defined: 3
}

entity V as SELECT FROM C.E;
//                      ^ defined: 2
