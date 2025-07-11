import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { BaseService } from "@src/app/base/base.service";
import { Repository } from "typeorm";

import { MeetingSession } from "../entities/meetSession.entity";

@Injectable()
export class MeetingSessionService extends BaseService<MeetingSession> {
  constructor(
    @InjectRepository(MeetingSession)
    public readonly _repo: Repository<MeetingSession>
  ) {
    super(_repo);
  }
}
