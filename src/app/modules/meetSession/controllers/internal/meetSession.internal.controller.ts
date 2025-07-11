import { Controller } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

import { MeetingSessionService } from "../../services/meetSession.service";

@ApiTags("MeetingSessions")
@ApiBearerAuth()
// @Auth(AuthType.None)
@Controller("meeting-sessions")
export class InternalMeetingSessionController {
  RELATIONS = [];

  constructor(private readonly service: MeetingSessionService) {}
}
