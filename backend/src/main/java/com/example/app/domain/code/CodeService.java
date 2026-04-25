package com.example.app.domain.code;

import com.example.app.api.code.CodeResponse;
import com.example.app.api.code.GenerateCodeRequest;
import com.example.app.api.code.ScanCodeRequest;
import com.example.app.api.code.ScanCodeResponse;
import com.example.app.domain.user.Role;
import java.util.UUID;

public interface CodeService {

    CodeResponse generate(GenerateCodeRequest request);

    ScanCodeResponse scan(ScanCodeRequest request);

    CodeResponse view(UUID codeId, UUID actorId, Role actorRole);
}
