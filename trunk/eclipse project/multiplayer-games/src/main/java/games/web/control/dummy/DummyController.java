package games.web.control.dummy;

import games.model.dummy.Dummy;
import org.springframework.roo.addon.web.mvc.controller.scaffold.RooWebScaffold;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@RequestMapping("/dummys")
@Controller
@RooWebScaffold(path = "dummys", formBackingObject = Dummy.class)
public class DummyController {
}
