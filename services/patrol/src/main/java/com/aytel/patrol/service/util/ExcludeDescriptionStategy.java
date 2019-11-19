package com.aytel.patrol.service.util;

import com.google.gson.ExclusionStrategy;
import com.google.gson.FieldAttributes;

import java.util.Objects;

public class ExcludeDescriptionStategy implements ExclusionStrategy {
    @Override
    public boolean shouldSkipField(FieldAttributes f) {
        return Objects.equals(f.getName(), "description");
    }

    @Override
    public boolean shouldSkipClass(Class<?> clazz) {
        return false;
    }
}
